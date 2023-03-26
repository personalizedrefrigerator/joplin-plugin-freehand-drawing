import Editor, { EditorEventType, ActionButtonWidget, KeyPressEvent, AbstractComponent, BackgroundComponent, Vec2, Rect2, Erase } from 'js-draw';
import 'js-draw/bundledStyles';
import localization from '../localization';
import { escapeHtml } from '../util/htmlUtil';
import { ShowCloseButtonRequest, HideCloseButtonRequest, InitialSvgDataRequest, SaveMessage, WebViewMessage } from '../types';

declare const webviewApi: any;

let haveLoadedFromSvg = false;
const editor = new Editor(document.body);
const toolbar = editor.addToolbar();
editor.focus();

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
	return editor.icons.makeSaveIcon();
};

const templateKey = 'jsdraw-image-template';

// Update the template for new images.
const updateTemplateData = () => {
	// Find the topmost background component.
	let topmostBackgroundComponent: BackgroundComponent|null = null;
	for (const elem of editor.image.getBackgroundComponents()) {
		if (elem instanceof BackgroundComponent) {
			topmostBackgroundComponent = elem;
		}
	}

	let editorBackgroundData: Record<string, any> = {};
	if (topmostBackgroundComponent) {
		editorBackgroundData = topmostBackgroundComponent.serialize();
	}

	const imageSize = editor.getImportExportRect().size;

	const template = JSON.stringify({
		backgroundData: editorBackgroundData,
		imageSize: [ imageSize.x, imageSize.y ],
	});
	localStorage.setItem(templateKey, template);
};

// Initialize the editor's state from the template stored in localStorage.
// This must be done in a way that can be overwritten by editor.loadFrom.
const initFromTemplate = () => {
	try {
		const data = JSON.parse(localStorage.getItem(templateKey) ?? '{ "imageSize": [ 500, 500 ] }');

		if (
			'imageSize' in data
			&& typeof data['imageSize'][0] === 'number'
			&& typeof data['imageSize'][1] === 'number'
			&& isFinite(data['imageSize'][0])
			&& isFinite(data['imageSize'][1])
		) {
			let width = data.imageSize[0];
			let height = data.imageSize[1];

			// Don't allow the template to create extremely small or extremely large images.
			const minDimension = 50;
			const maxDimension = 5000;
			width = Math.min(maxDimension, Math.max(minDimension, width));
			height = Math.min(maxDimension, Math.max(minDimension, height));

			const imageSize = Vec2.of(width, height);
			const addToHistory = false;
			editor.dispatchNoAnnounce(
				editor.setImportExportRect(new Rect2(0, 0, imageSize.x, imageSize.y)),
				addToHistory
			);
		}

		if ('backgroundData' in data) {
			const background = AbstractComponent.deserialize(data.backgroundData);
			const addToHistory = false;
			editor.dispatchNoAnnounce(editor.image.addElement(background), addToHistory);
		}
	} catch(e) {
		console.warn('Error initializing js-draw from template: ', e);
	}
};

const showSaveScreen = () => {
	updateTemplateData();

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
};

const showCloseScreen = () => {
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
};

toolbar.addSpacer({ grow: 1, maxSize: '15px' });
toolbar.addActionButton({
	label: localization.close,
	icon: makeCloseIcon(),
}, () => {
	showCloseScreen();
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


class SaveActionButton extends ActionButtonWidget {
	public constructor() {
		super(editor, 'save-button', makeSaveIcon, localization.save, showSaveScreen);
	}

	protected onKeyPress(event: KeyPressEvent): boolean {
		if (event.ctrlKey) {
			if (event.key.toLocaleUpperCase() === 'S' || event.key === 's') {
				showSaveScreen();
				return true;
			}
		}

		return false;
	}

	public canBeInOverflowMenu(): boolean {
		return false;
	}
}

toolbar.addSpacer({ grow: 1, maxSize: '15px' });
toolbar.addWidget(new SaveActionButton());

initFromTemplate();

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
		// Clear the background
		const addToHistory = false;
		editor.dispatchNoAnnounce(new Erase(editor.image.getBackgroundComponents()), addToHistory);

		haveLoadedFromSvg = true;
		editor.loadFromSVG(result);
	}
});

// Autosave every two minutes.
const autosaveInterval = 1000 * 60 * 2;
setInterval(async () => {
	console.log('autosaving...');
	const message: WebViewMessage = {
		type: 'autosave',
		data: toSVG(),
	};
	await webviewApi.postMessage(message);
	console.log('Done autosaving.');
}, autosaveInterval);

// Save and restore toolbar state (e.g. pen colors)
const setupToolbarStateSaveRestore = () => {
	const toolbarStateKey = 'jsdraw-toolbarState';
	editor.notifier.on(EditorEventType.ToolUpdated, () => {
		localStorage.setItem(toolbarStateKey, toolbar.serializeState());
	});

	try {
		const toolbarState = localStorage.getItem(toolbarStateKey);
		toolbar.deserializeState(toolbarState);
	} catch(e) {
		console.warn('Error restoring toolbar state!', e);
	}
};
setupToolbarStateSaveRestore();
