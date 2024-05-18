import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { pluginPrefix } from '../constants';
import { SaveMethod, WebViewMessage } from '../types';
import AbstractDrawingView, { OnWebViewMessageHandler } from './AbstractDrawingView';
import TemporaryDirectory from '../TemporaryDirectory';

const dialogs = joplin.views.dialogs;

type SaveCallback = (svgData: string) => void | Promise<void>;
type SaveCallbacks =
	| {
			saveAsNew: SaveCallback;
			overwrite: SaveCallback;
	  }
	| {
			saveAsNew: null;
			overwrite: SaveCallback;
	  };

export interface InsertDrawingOptions {
	initialData: string | undefined;
	saveCallbacks: SaveCallbacks;
	initialSaveMethod?: SaveMethod;
}

export default class DrawingDialog extends AbstractDrawingView {
	private static instance: DrawingDialog;
	private handle: string;
	private canFullscreen: boolean = true;
	private isFullscreen: boolean = false;

	/** @returns a reference to the singleton instance of the DrawingDialog. */
	public static async getInstance(tempDir: TemporaryDirectory): Promise<DrawingDialog> {
		if (!DrawingDialog.instance) {
			DrawingDialog.instance = new DrawingDialog(tempDir);

			DrawingDialog.instance.handle = await dialogs.create(`${pluginPrefix}jsDrawDialog`);
			await DrawingDialog.instance.initializeDialog();
		}

		return DrawingDialog.instance;
	}

	protected override async initializeDialog() {
		await super.initializeDialog();

		await dialogs.setHtml(this.handle, '');
		await dialogs.setFitToContent(this.handle, false);
		await this.setFullscreen(false);
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
	protected override async setDialogButtons(buttons: ButtonSpec[]) {
		// No buttons? Allow fullscreen.
		await this.setFullscreen(buttons.length === 0);
		await dialogs.setButtons(this.handle, buttons);
	}

	protected override addScript(path: string): Promise<void> {
		return dialogs.addScript(this.handle, path);
	}

	protected override postMessage(message: WebViewMessage) {
		joplin.views.panels.postMessage(this.handle, message);
	}

	protected override onMessage(onMessageHandler: OnWebViewMessageHandler) {
		joplin.views.panels.onMessage(this.handle, onMessageHandler);
	}

	protected override showDialog(): Promise<DialogResult> {
		return dialogs.open(this.handle);
	}
}
