import 'js-draw/bundledStyles';
import localization from '../../localization';
import {
	InitialSvgDataRequest,
	SaveMessage,
	WebViewMessage,
	WebViewMessageResponse,
	InitialDataResponse,
	MessageType,
	ResponseType,
	SaveMethod,
} from '../../types';
import svgElementToString from './svgElementToString';
import startAutosaveLoop from './startAutosaveLoop';
import { PostMessageCallback } from './types';
import makeJsDrawEditor, { EditorControl } from './makeJsDrawEditor';
import localStorageSettingControl from './settings/localStorageSettingControl';

type OnMessageCallback = (info: { message: WebViewMessage }) => void;
declare const webviewApi: {
	postMessage: PostMessageCallback;
	onMessage: (onMessage: OnMessageCallback) => void;
};

let haveLoadedFromSvg = false;

let saveCompletedListeners: Array<() => void> = [];
let editorControl: EditorControl | null = null;

// Returns false if save screen is shown, true if saved
// without the need for a screen.
const showSaveScreen = async () => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	const saveMessage: SaveMessage = {
		type: MessageType.SaveSVG,
		data: svgElementToString(editor.toSVG()),
	};
	const response = await webviewApi.postMessage({ ...saveMessage });
	if (response !== true && response.type === ResponseType.SaveResponse) {
		// If already saved, exit!
		if (!response.waitingForSaveType) {
			return true;
		}
	} else {
		throw new Error('Invalid response ' + response);
	}

	editor.getRootElement().style.display = 'none';

	const dialogContainer = document.createElement('form');
	dialogContainer.className = 'save-or-exit-dialog';
	dialogContainer.name = 'saveOptions';

	const hideSaveScreen = async () => {
		editor.getRootElement().style.display = '';
		dialogContainer.remove();
		await webviewApi.postMessage({ type: MessageType.HideButtons });
	};

	const resumeEditingButton = document.createElement('button');
	resumeEditingButton.innerText = localization.saveAndResumeEditing;
	resumeEditingButton.onclick = async () => {
		await hideSaveScreen();
		await webviewApi.postMessage({ ...saveMessage });
		editor.focus();
	};

	const saveOptionsContainer = document.createElement('div');
	let idCounter = 0;
	const addSaveOption = (label: string, value: SaveMethod, checked: boolean = false) => {
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

		const onUpdate = async () => {
			if (inputElem.checked) {
				await webviewApi.postMessage({
					type: MessageType.SetSaveMethod,
					method: value,
				});
			}
		};

		onUpdate();
		inputElem.oninput = onUpdate;
	};

	// We can only overwrite the resource if we loaded the SVG from a resource.
	if (haveLoadedFromSvg) {
		addSaveOption(localization.overwriteExisting, SaveMethod.Overwrite, true);
		addSaveOption(localization.saveAsNewDrawing, SaveMethod.SaveAsNew);
	}

	const messageElem = document.createElement('div');
	messageElem.innerText = localization.clickOkToContinue;

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('button-container');
	buttonContainer.replaceChildren(resumeEditingButton);

	dialogContainer.replaceChildren(messageElem, saveOptionsContainer, buttonContainer);

	document.body.appendChild(dialogContainer);
	return false;
};

const showCloseScreen = () => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	webviewApi.postMessage({
		type: MessageType.ShowCloseButton,
		isSaved: !editorControl.hasUnsavedChanges(),
	});

	editor.getRootElement().style.display = 'none';

	const dialogContainer = document.createElement('div');
	dialogContainer.classList.add('save-or-exit-dialog');

	const hideExitScreen = async () => {
		editor.getRootElement().style.display = '';
		dialogContainer.remove();
		await webviewApi.postMessage({ type: MessageType.HideButtons });
	};

	const message = document.createElement('div');

	if (editorControl.hasUnsavedChanges()) {
		dialogContainer.classList.add('has-unsaved-changes');
		message.innerText = localization.discardUnsavedChanges;
	} else {
		message.innerText = localization.exitInstructions;
	}

	const resumeEditingBtn = document.createElement('button');
	resumeEditingBtn.innerText = localization.resumeEditing;

	resumeEditingBtn.onclick = async () => {
		await hideExitScreen();
		editor.focus();
	};

	const saveChangesButton = document.createElement('button');
	saveChangesButton.innerText = localization.saveChanges;
	saveChangesButton.classList.add('save-changes-button');

	saveChangesButton.onclick = async () => {
		await hideExitScreen();

		const saveCompletedListener = new Promise<void>((resolve) => {
			saveCompletedListeners.push(() => resolve());
		});
		const saved = await showSaveScreen();

		if (saved) {
			await saveCompletedListener;
			showCloseScreen();
		}
	};

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('button-container');
	buttonContainer.replaceChildren(resumeEditingBtn, saveChangesButton);

	dialogContainer.replaceChildren(message, buttonContainer);
	document.body.appendChild(dialogContainer);
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
	startAutosaveLoop(editorControl.editor, initializationData.autosaveIntervalMS, (message) =>
		webviewApi.postMessage(message),
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
