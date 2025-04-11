import joplin from 'api';
import { ButtonSpec, DialogResult, ViewHandle } from 'api/types';
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

let dialogCounter = 0;
export default class DrawingDialog extends AbstractDrawingView {
	private handle: Promise<ViewHandle>;
	private canFullscreen: boolean = false;

	private constructor(handle: Promise<ViewHandle>, tempDir: TemporaryDirectory) {
		super(tempDir);
		this.handle = handle;
	}

	public static create(tempDir: TemporaryDirectory) {
		const handlePromise = dialogs.create(`${pluginPrefix}jsDrawDialog-${dialogCounter++}`);
		return new DrawingDialog(handlePromise, tempDir);
	}

	protected override async initializeDialog() {
		await super.initializeDialog();

		const handle = await this.handle;
		await dialogs.setHtml(handle, '');
		await dialogs.setFitToContent(handle, false);
	}

	/**
	 * Sets whether this dialog is automatically set to fullscreen mode when the
	 * editor is visible.
	 */
	public override async setCanFullscreen(canFullscreen: boolean) {
		if (this.canFullscreen === canFullscreen) {
			return;
		}
		this.canFullscreen = canFullscreen;

		const installationDir = await joplin.plugins.installationDir();

		const cssFile = canFullscreen ? 'dialogFullscreen.css' : 'dialogNonfullscreen.css';
		await joplin.window.loadChromeCssFile(installationDir + '/dialog/userchromeStyles/' + cssFile);
	}

	/**
	 * Sets the buttons visible at the bottom of the dialog and toggles fullscreen if necessary (to ensure the buttons)
	 * are visible.
	 */
	protected override async setDialogButtons(buttons: ButtonSpec[]) {
		const handle = await this.handle;
		await dialogs.setButtons(handle, buttons);
	}

	protected override async addScript(path: string): Promise<void> {
		await dialogs.addScript(await this.handle, path);
	}

	protected override async postMessage(message: WebViewMessage) {
		joplin.views.panels.postMessage(await this.handle, message);
	}

	protected override async onMessage(onMessageHandler: OnWebViewMessageHandler) {
		joplin.views.panels.onMessage(await this.handle, onMessageHandler);
	}

	protected override async showDialog(): Promise<DialogResult> {
		return dialogs.open(await this.handle);
	}
}
