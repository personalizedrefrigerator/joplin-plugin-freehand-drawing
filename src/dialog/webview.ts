import Editor from 'js-draw';
import 'js-draw/bundle';
import { ShowCloseButtonRequest, HideCloseButtonRequest, InitialSvgDataRequest, SaveMessage, WebViewMessage } from '../types';

declare const webviewApi: any;

let haveLoadedFromSvg = false;
const editor = new Editor(document.body);
const toolbar = editor.addToolbar();

toolbar.addActionButton('Close', () => {
	webviewApi.postMessage({ type: 'showCloseUnsavedBtn' } as ShowCloseButtonRequest);

	const originalDisplay = editor.getRootElement().style.display;
	editor.getRootElement().style.display = 'none';

	const confirmationDialog = document.createElement('div');
	confirmationDialog.className = 'exitOptionsDialog';

	const message = document.createElement('div');
	message.innerText = 'Discard unsaved changes?';

	const resumeEditingBtn = document.createElement('button');
	resumeEditingBtn.innerText = 'Resume editing';

	resumeEditingBtn.onclick = () => {
		webviewApi.postMessage({ type: 'hideCloseUnsavedBtn' } as HideCloseButtonRequest);
		editor.getRootElement().style.display = originalDisplay;
		confirmationDialog.remove();
	};

	confirmationDialog.replaceChildren(message, resumeEditingBtn);
	document.body.appendChild(confirmationDialog);
});

toolbar.addActionButton('Save', () => {
	const saveMessage: SaveMessage = {
		type: 'saveSVG',
		data: editor.toSVG().outerHTML,
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
		addSaveOption('Overwrite existing', 'overwrite', true);
		addSaveOption('Save as a copy', 'saveAsCopy');
	}
	
	const messageElem = document.createElement('div');
	messageElem.innerText = 'Done! Click "ok" to continue.';

	doneMessageContainer.replaceChildren(
		messageElem, saveOptionsContainer
	);

	document.body.appendChild(doneMessageContainer);
});

webviewApi.onMessage((message: WebViewMessage) => {
	if (message.type === 'resumeEditing') {
		editor.getRootElement().style.visibility = 'unset';
	} else {
		console.log('unknown message', message);
	}
});

const loadedMessage: InitialSvgDataRequest = {
	type: 'getInitialData',
};
webviewApi.postMessage(loadedMessage).then(result => {
	// Don't load the image multiple times.
	if (result && !haveLoadedFromSvg) {
		haveLoadedFromSvg = true;
		editor.loadFromSVG(result);
	}
});
