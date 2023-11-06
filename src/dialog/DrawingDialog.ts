import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { autosave, clearAutosave } from '../autosave';
import { pluginPrefix } from '../constants';
import localization from '../localization';
import {
	EditorStyle,
	MessageType,
	ResponseType,
	SaveCompletedMessage,
	SaveMethod,
	ToolbarType,
	WebViewMessage,
	WebViewMessageResponse,
} from '../types';

const dialogs = joplin.views.dialogs;

type SaveCallback = (svgData: string) => void | Promise<void>;
type SaveCallbacks =
	| {
			saveAsNew: SaveCallback;
			overwrite?: undefined;
	  }
	| {
			saveAsNew: SaveCallback;
			overwrite: SaveCallback;
	  };

export interface InsertDrawingOptions {
	initialData: string | undefined;
	saveCallbacks: SaveCallbacks;
}

export default class DrawingDialog {
	private static instance: DrawingDialog;
	private handle: string;
	private canFullscreen: boolean = true;
	private isFullscreen: boolean = false;
	private autosaveInterval: number = 120 * 1000; // ms
	private toolbarType: ToolbarType = ToolbarType.Default;
	private styleMode: EditorStyle = EditorStyle.MatchJoplin;

	/** @returns a reference to the singleton instance of the DrawingDialog. */
	public static async getInstance(): Promise<DrawingDialog> {
		if (!DrawingDialog.instance) {
			DrawingDialog.instance = new DrawingDialog();

			DrawingDialog.instance.handle = await dialogs.create(`${pluginPrefix}jsDrawDialog`);
			await DrawingDialog.instance.initializeDialog();
		}

		return DrawingDialog.instance;
	}

	private constructor() {
		// Constructor should not be called directly.
		// Use .getInstance.
	}

	/** Resets the dialog prior to use. This can be called multiple times. */
	private async initializeDialog() {
		// Sometimes, the dialog doesn't load properly.
		// Add a cancel button to hide it and try loading again.
		await dialogs.setButtons(this.handle, [{ id: 'cancel' }]);
		await dialogs.setHtml(this.handle, '');

		// Script path is from the root of the plugin directory
		await dialogs.addScript(this.handle, './dialog/webview/webview.js');
		await dialogs.addScript(this.handle, './dialog/webview/webview.css');

		await dialogs.setFitToContent(this.handle, false);
		await this.setFullscreen(false);
	}

	/** Sets the autosave interval in milliseconds. Takes effect on the next editor launch. */
	public async setAutosaveInterval(interval: number) {
		this.autosaveInterval = interval;
	}

	/** Sets the toolbar to be displayed in the dialog. Takes effect on the next editor launch. */
	public setToolbarType(type: ToolbarType) {
		this.toolbarType = type;
	}

	/** Changes the editor's style. Takes effect on the next launch of the editor. */
	public setStyleMode(style: EditorStyle) {
		this.styleMode = style;
	}

	/**
	 * Sets whether this dialog is automatically set to fullscreen mode when the
	 * editor is visible.
	 */
	public async setCanFullscreen(canFullscreen: boolean) {
		this.canFullscreen = canFullscreen;

		if (!canFullscreen) {
			this.setFullscreen(false);
		}
	}

	/** Set whether this drawing dialog takes up the entire Joplin window. */
	private async setFullscreen(fullscreen: boolean) {
		if (this.isFullscreen === fullscreen) {
			return;
		}

		if (!this.canFullscreen && fullscreen) {
			return;
		}

		this.isFullscreen = fullscreen;

		const installationDir = await joplin.plugins.installationDir();

		const cssFile = fullscreen ? 'dialogFullscreen.css' : 'dialogNonfullscreen.css';
		await joplin.window.loadChromeCssFile(installationDir + '/dialog/userchromeStyles/' + cssFile);
	}

	/**
	 * Sets the buttons visible at the bottom of the dialog and toggles fullscreen if necessary (to ensure the buttons)
	 * are visible.
	 */
	private async setDialogButtons(buttons: ButtonSpec[]) {
		// No buttons? Allow fullscreen.
		await this.setFullscreen(buttons.length === 0);
		await dialogs.setButtons(this.handle, buttons);
	}

	/**
	 * Displays a dialog that allows the user to insert a drawing.
	 *
	 * @returns true if the drawing was saved at least once.
	 */
	public async promptForDrawing(options: InsertDrawingOptions): Promise<boolean> {
		await this.initializeDialog();

		let saveOption: SaveMethod | null = null;

		if (!options.saveCallbacks.overwrite) {
			saveOption = SaveMethod.SaveAsNew;
		}

		const save = async (data: string) => {
			try {
				if (saveOption === SaveMethod.SaveAsNew) {
					await options.saveCallbacks.saveAsNew(data);
				} else if (saveOption === SaveMethod.Overwrite) {
					if (options.saveCallbacks.overwrite) {
						await options.saveCallbacks.overwrite(data);
					} else {
						throw new Error('overwrite save callback not defined');
					}
				} else {
					throw new Error('saveOption must be either saveAsNew or overwrite');
				}

				joplin.views.panels.postMessage(this.handle, {
					type: MessageType.SaveCompleted,
				} as SaveCompletedMessage);
			} catch (error) {
				console.error('js-draw', error);
				alert('Not saved: ' + error);
			}
		};

		const result = new Promise<boolean>((resolve, reject) => {
			let saveData: string | null = null;
			joplin.views.panels.onMessage(
				this.handle,
				(message: WebViewMessage): WebViewMessageResponse => {
					if (message.type === 'saveSVG' && !saveOption) {
						saveData = message.data;

						this.setDialogButtons([
							{
								id: 'ok',
								title: 'Save and close',
							},
						]);

						return {
							type: ResponseType.SaveResponse,
							waitingForSaveType: true,
						};
					} else if (message.type === 'saveSVG' && saveOption) {
						void save(message.data);
						saveData = null;

						return {
							type: ResponseType.SaveResponse,
							waitingForSaveType: false,
						};
					} else if (message.type === MessageType.SetSaveMethod) {
						saveOption = message.method;
					} else if (message.type === MessageType.GetInitialData) {
						// The drawing dialog has loaded -- we don't need the exit button.
						this.setDialogButtons([]);

						return {
							type: ResponseType.InitialDataResponse,

							autosaveIntervalMS: this.autosaveInterval,
							toolbarType: this.toolbarType,
							initialData: options.initialData,
							styleMode: this.styleMode,
						};
					} else if (message.type === MessageType.ShowCloseButton) {
						this.setDialogButtons([
							{
								id: 'cancel',
								title: message.isSaved ? localization.close : localization.discardChanges,
							},
						]);
					} else if (message.type === MessageType.HideButtons) {
						this.setDialogButtons([]);
						saveData = null;
					} else if (message.type === MessageType.AutosaveSVG) {
						void clearAutosave().then(() => {
							void autosave(message.data);
						});
					}

					return true;
				},
			);

			dialogs.open(this.handle).then(async (result: DialogResult) => {
				if (saveData && result.id === 'ok') {
					saveOption ??= result.formData?.saveOptions?.saveOption ?? SaveMethod.SaveAsNew;
					await save(saveData);
					resolve(true);
				} else if (result.id === 'cancel') {
					resolve(false);
				} else {
					reject(`Unknown button ID ${result.id}`);
				}
			});
		});
		return await result;
	}
}
