import 'js-draw/bundledStyles';
import localization from '../../localization';
import {
	HideCloseButtonRequest,
	InitialSvgDataRequest,
	SaveMessage,
	WebViewMessage,
	WebViewMessageResponse,
	InitialDataResponse,
} from '../../types';
import svgElementToString from './svgElementToString';
import startAutosaveLoop from './startAutosaveLoop';
import { PostMessageCallback } from './types';
import makeJsDrawEditor, { EditorControl } from './makeJsDrawEditor';
import localStorageSettingControl from './settings/localStorageSettingControl';

declare const webviewApi: any;
const postWebviewMessage: PostMessageCallback = webviewApi.postMessage;

let haveLoadedFromSvg = false;

let editorControl: EditorControl | null = null;

const showSaveScreen = () => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	const saveMessage: SaveMessage = {
		type: 'saveSVG',
		data: svgElementToString(editor.toSVG()),
	};
	webviewApi.postMessage(saveMessage);
	editor.getRootElement().remove();

	const doneMessageContainer = document.createElement('form');
	doneMessageContainer.className = 'exitOptionsDialog';
	doneMessageContainer.name = 'saveOptions';

	const saveOptionsContainer = document.createElement('div');
	let idCounter = 0;
	const addSaveOption = (label: string, value: string, checked: boolean = false) => {
		const saveOptionRow = document.createElement('div');
		const labelElem = document.createElement('label');
		const inputElem = document.createElement('input');

		inputElem.name = 'saveOption';
		inputElem.value = value;
		inputElem.type = 'radio';

		inputElem.id = `saveOption-${idCounter++}`;
		labelElem.setAttribute('for', inputElem.id);

		inputElem.checked = checked;
		labelElem.innerText = label;

		saveOptionRow.replaceChildren(inputElem, labelElem);
		saveOptionsContainer.appendChild(saveOptionRow);
	};

	// We can only overwrite the resource if we loaded the SVG from a resource.
	if (haveLoadedFromSvg) {
		addSaveOption(localization.overwriteExisting, 'overwrite', true);
		addSaveOption(localization.saveAsNewDrawing, 'saveAsCopy');
	}

	const messageElem = document.createElement('div');
	messageElem.innerText = localization.clickOkToContinue;

	doneMessageContainer.replaceChildren(messageElem, saveOptionsContainer);

	document.body.appendChild(doneMessageContainer);
};

const showCloseScreen = () => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	postWebviewMessage({ type: 'showCloseUnsavedBtn' });

	const originalDisplay = editor.getRootElement().style.display;
	editor.getRootElement().style.display = 'none';

	const confirmationDialog = document.createElement('div');
	confirmationDialog.className = 'exitOptionsDialog';

	const message = document.createElement('div');
	message.innerText = localization.discardUnsavedChanges;

	const resumeEditingBtn = document.createElement('button');
	resumeEditingBtn.innerText = localization.resumeEditing;

	resumeEditingBtn.onclick = () => {
		webviewApi.postMessage({ type: 'hideCloseUnsavedBtn' } as HideCloseButtonRequest);
		editor.getRootElement().style.display = originalDisplay;
		confirmationDialog.remove();
	};

	confirmationDialog.replaceChildren(message, resumeEditingBtn);
	document.body.appendChild(confirmationDialog);
};

let editorInitializationData: InitialDataResponse | null = null;

const initializeEditor = (
	editorControl: EditorControl,
	initializationData: InitialDataResponse,
) => {
	editorControl.setToolbarMode(initializationData.toolbarType);
	editorControl.applyStyle(initializationData.styleMode);

	// If given initial data,
	if (initializationData.initialData) {
		// We did load from an SVG
		haveLoadedFromSvg = true;

		editorControl.loadInitialImage(initializationData.initialData);
	}

	// Set the autosave interval
	startAutosaveLoop(
		editorControl.editor,
		initializationData.autosaveIntervalMS,
		postWebviewMessage,
	);
};

void (async () => {
	editorControl = await makeJsDrawEditor(localStorageSettingControl, {
		onSave: showSaveScreen,
		onExit: showCloseScreen,
	});

	if (editorInitializationData) {
		initializeEditor(editorControl, editorInitializationData);
	}
})();

webviewApi.onMessage((message: WebViewMessage) => {
	if (message.type === 'resumeEditing') {
		if (editorControl) {
			editorControl.editor.getRootElement().style.visibility = 'unset';
		}
	} else {
		console.log('unknown message', message);
	}
});

// Get initial data and app settings
const loadedMessage: InitialSvgDataRequest = {
	type: 'getInitialData',
};
postWebviewMessage(loadedMessage).then(async (result: WebViewMessageResponse) => {
	// Don't load the image multiple times.
	if (result?.type === 'initialDataResponse' && !haveLoadedFromSvg) {
		if (editorControl) {
			initializeEditor(editorControl, result);
		} else {
			editorInitializationData = result;
		}
	}
});
