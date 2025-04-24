import 'js-draw/bundledStyles';
import './setUpLocalization';
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
import { LoadImageTask, PostMessageCallback } from './types';
import makeJsDrawEditor, { EditorControl } from './makeJsDrawEditor';
import localStorageSettingControl from './settings/localStorageSettingControl';
import showSaveScreen from './screens/showSaveScreen';
import showCloseScreen from './screens/showCloseScreen';

type OnMessageCallback = (info: { message: WebViewMessage }) => Promise<WebViewMessageResponse>;
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

const showImagePicker = async (): Promise<LoadImageTask> => {
	const response = await webviewApi.postMessage({ type: MessageType.ShowImagePicker });

	if (typeof response !== 'object' || response.type !== ResponseType.ImagePickerTaskResponse) {
		throw new Error(`Invalid response or type ${response}`);
	}

	const images = (async () => {
		const imagePickerResponse = await webviewApi.postMessage({
			type: MessageType.GetImagePickerResult,
			taskId: response.taskId,
		});

		if (
			typeof imagePickerResponse !== 'object' ||
			imagePickerResponse.type !== ResponseType.ImagePickerResponse
		) {
			throw new Error(`Invalid response or type ${imagePickerResponse}`);
		}

		return imagePickerResponse.images;
	})();

	return {
		images,
		cancel: () => {
			webviewApi.postMessage({ type: MessageType.CancelImagePicker, taskId: response.taskId });
		},
		cleanUp: () => {
			webviewApi.postMessage({
				type: MessageType.CleanUpImagePickerResult,
				taskId: response.taskId,
			});
		},
	};
};

void (async () => {
	editorControl = await makeJsDrawEditor(localStorageSettingControl, {
		onSave: () => showSaveScreen(editorControl, postMessageCallback),
		onExit: () => showCloseScreen(editorControl, postMessageCallback, addSaveCompletedListener),
		showImagePicker,
	});

	if (editorInitializationData) {
		initializeEditor(editorControl, editorInitializationData);
	}
})();

webviewApi.onMessage(async ({ message }) => {
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
		return true;
	} else {
		console.log('unknown message', message);
		throw new Error(`Unknown message: ${message}`);
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
