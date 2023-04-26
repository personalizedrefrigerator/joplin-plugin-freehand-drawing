import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { autosave, clearAutosave } from '../autosave';
import { pluginPrefix } from '../constants';
import localization from '../localization';
import { WebViewMessage, WebViewMessageResponse } from '../types';

const dialogs = joplin.views.dialogs;
export type SaveOptionType = 'saveAsCopy' | 'overwrite';

export default class DrawingDialog {
	private static instance: DrawingDialog;
	private handle: string;
	private canFullscreen: boolean = true;
	private isFullscreen: boolean = false;
	private autosaveInterval: number = 120 * 1000; // ms

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
		await dialogs.addScript(this.handle, './dialog/webview.js');
		await dialogs.addScript(this.handle, './dialog/webview.css');

		await dialogs.setFitToContent(this.handle, false);
		await this.setFullscreen(false);
	}

	/** Sets the autosave interval in milliseconds. */
	public async setAutosaveInterval(interval: number) {
		this.autosaveInterval = interval;
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
	 * @returns the saved drawing or `null` if the action was canceled by the user.
	 */
	public async promptForDrawing (initialData?: string): Promise<[string, SaveOptionType]|null> {
		await this.initializeDialog();
	
		const result = new Promise<[string, SaveOptionType]|null>((resolve, reject) => {
			let saveData: string|null = null;
			joplin.views.panels.onMessage(this.handle, (message: WebViewMessage): WebViewMessageResponse => {
				if (message.type === 'saveSVG') {
					saveData = message.data;
	
					this.setDialogButtons([{
						id: 'ok',
					}]);
				} else if (message.type === 'getInitialData') {
					// The drawing dialog has loaded -- we don't need the exit button.
					this.setDialogButtons([]);
	
					return {
						type: 'initialDataResponse',

						autosaveIntervalMS: this.autosaveInterval,
						initialData,
					};
				} else if (message.type === 'showCloseUnsavedBtn') {
					this.setDialogButtons([{
						id: 'cancel',
						title: localization.discardChanges,
					}]);
				} else if (message.type === 'hideCloseUnsavedBtn') {
					this.setDialogButtons([]);
				} else if (message.type === 'autosave') {
					void clearAutosave().then(() => {
						void autosave(message.data);
					});
				}

				return null;
			});
	
			dialogs.open(this.handle).then((result: DialogResult) => {
				if (saveData && result.id === 'ok') {
					const saveOption: SaveOptionType = result.formData?.saveOptions?.saveOption ?? 'saveAsCopy';
					resolve([ saveData, saveOption ]);
				} else if (result.id === 'cancel') {
					resolve(null);
				} else {
					reject(`Unknown button ID ${result.id}`);
				}
			});
		});
		return await result;
	}
}
