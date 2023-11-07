import 'js-draw/bundledStyles';
import {
	InitialSvgDataRequest,
	WebViewMessage,
	WebViewMessageResponse,
	InitialDataResponse,
	MessageType,
	ResponseType,
	SaveMethod,
} from '../../types';
import startAutosaveLoop from './startAutosaveLoop';
import { PostMessageCallback } from './types';
import makeJsDrawEditor, { EditorControl } from './makeJsDrawEditor';
import localStorageSettingControl from './settings/localStorageSettingControl';
import showSaveScreen from './screens/showSaveScreen';
import showCloseScreen from './screens/showCloseScreen';

type OnMessageCallback = (info: { message: WebViewMessage }) => void;
declare const webviewApi: {
	postMessage: PostMessageCallback;
	onMessage: (onMessage: OnMessageCallback) => void;
};
const postMessageCallback: PostMessageCallback = (message) => webviewApi.postMessage(message);

let haveLoadedFromSvg = false;

let saveCompletedListeners: Array<() => void> = [];
let editorControl: EditorControl | null = null;

let editorInitializationData: InitialDataResponse | null = null;

const initializeEditor = (
	editorControl: EditorControl,
	initializationData: InitialDataResponse,
) => {
	editorControl.setToolbarMode(initializationData.toolbarType);
	editorControl.applyStyle(initializationData.styleMode);
	editorControl.applyShortcutOverrides(initializationData.keyboardShortcuts);

	// If given initial data,
	if (initializationData.initialData) {
		// We did load from an SVG
		haveLoadedFromSvg = true;

		editorControl.loadInitialImage(initializationData.initialData);
	}

	// Set the autosave interval
	startAutosaveLoop(editorControl.editor, initializationData.autosaveIntervalMS, (message) =>
		webviewApi.postMessage(message),
	);
};

const addSaveCompletedListener = (listener: () => void) => {
	saveCompletedListeners.push(listener);
};

void (async () => {
	editorControl = await makeJsDrawEditor(localStorageSettingControl, {
		onSave: () => showSaveScreen(editorControl, postMessageCallback),
		onExit: () => showCloseScreen(editorControl, postMessageCallback, addSaveCompletedListener),
	});

	if (editorInitializationData) {
		initializeEditor(editorControl, editorInitializationData);
	}
})();

webviewApi.onMessage(({ message }) => {
	if (message.type === MessageType.SaveCompleted) {
		editorControl?.onSaved();

		// After saving as a new drawing once, we should update the new
		// drawing.
		webviewApi.postMessage({
			type: MessageType.SetSaveMethod,
			method: SaveMethod.Overwrite,
		});

		for (const listener of saveCompletedListeners) {
			listener();
		}
		saveCompletedListeners = [];
	} else {
		console.log('unknown message', message);
	}
});

// Get initial data and app settings
const loadedMessage: InitialSvgDataRequest = {
	type: MessageType.GetInitialData,
};

webviewApi.postMessage(loadedMessage).then(async (result: WebViewMessageResponse) => {
	if (result !== true && result.type === ResponseType.InitialDataResponse && !haveLoadedFromSvg) {
		if (editorControl) {
			initializeEditor(editorControl, result);
		} else {
			editorInitializationData = result;
		}
	}
});
