import Editor from 'js-draw';
import 'js-draw/bundle';
import localization from '../localization';
import { escapeHtml } from '../htmlUtil';
import { ShowCloseButtonRequest, HideCloseButtonRequest, InitialSvgDataRequest, SaveMessage, WebViewMessage } from '../types';

declare const webviewApi: any;

let haveLoadedFromSvg = false;
const editor = new Editor(document.body);
const toolbar = editor.addToolbar();

const makeCloseIcon = () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `
		<style>
			.toolbar-close-icon {
				stroke: var(--icon-color);
				stroke-width: 10;
				stroke-linejoin: round;
				stroke-linecap: round;
				fill: none;
			}
		</style>
		<path
			d='
				M 15,15 85,85
				M 15,85 85,15
			'
			class='toolbar-close-icon'
		/>
	`;
	svg.setAttribute('viewBox', '0 0 100 100');
	return svg;
};

const makeSaveIcon = () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `
		<style>
			.toolbar-save-icon {
				stroke: var(--icon-color);
				stroke-width: 10;
				stroke-linejoin: round;
				stroke-linecap: round;
				fill: none;
			}
		</style>
		<path
			d='
				M 15,55 30,70 85,20
			'
			class='toolbar-save-icon'
		/>
	`;
	svg.setAttribute('viewBox', '0 0 100 100');
	return svg;
};

toolbar.addActionButton({
	label: localization.close,
	icon: makeCloseIcon(),
}, () => {
	webviewApi.postMessage({ type: 'showCloseUnsavedBtn' } as ShowCloseButtonRequest);

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
});

const toSVG = () => {
	const svgElem = editor.toSVG();

	// diagrams.io has special requirements for arguments encoding.
	// Generate the container element with custom code:
	const svgText = ['<svg'];
	for (const attr of svgElem.getAttributeNames()) {
		svgText.push(` ${attr}="${escapeHtml(svgElem.getAttribute(attr))}"`);
	}
	svgText.push('>');
	svgText.push(svgElem.innerHTML);
	svgText.push('</svg>');

	return svgText.join('');
};

toolbar.addActionButton({
	label: localization.save,
	icon: makeSaveIcon(),
}, () => {
	const saveMessage: SaveMessage = {
		type: 'saveSVG',
		data: toSVG(),
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

// Autosave every minute.
const autosaveInterval = 1000 * 60;
setInterval(async () => {
	console.log('autosaving...');
	const message: WebViewMessage = {
		type: 'autosave',
		data: toSVG(),
	};
	await webviewApi.postMessage(message);
	console.log('Done autosaving.');
}, autosaveInterval);
