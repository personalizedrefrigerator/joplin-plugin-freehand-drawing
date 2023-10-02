import Editor, {
	BackgroundComponentBackgroundType,
	EditorEventType,
	AbstractComponent,
	BackgroundComponent,
	Vec2,
	Rect2,
	Erase,
	makeEdgeToolbar,
	makeDropdownToolbar,
	adjustEditorThemeForContrast,
} from 'js-draw';
import { MaterialIconProvider } from '@js-draw/material-icons';
import 'js-draw/bundledStyles';
import localization from '../../localization';
import { escapeHtml } from '../../util/htmlUtil';
import {
	ShowCloseButtonRequest,
	HideCloseButtonRequest,
	InitialSvgDataRequest,
	SaveMessage,
	WebViewMessage,
	WebViewMessageResponse,
	ToolbarType,
	EditorStyle,
} from '../../types';

declare const webviewApi: any;

let haveLoadedFromSvg = false;
const editor = new Editor(document.body, {
	iconProvider: new MaterialIconProvider(),
});
editor.focus();

const lastEditorStyleKey = 'jsdraw-last-editor-style';

// Apply the last theme to the editor to prevent flickering on startup.
const lastEditorStyle = localStorage.getItem(lastEditorStyleKey) ?? EditorStyle.MatchJoplin;
editor.getRootElement().classList.add(lastEditorStyle);
adjustEditorThemeForContrast(editor);

const templateKey = 'jsdraw-image-template';

// Update the template for new images based on the current state of the editor
const updateTemplateData = () => {
	// Find the topmost background component.
	let topmostBackgroundComponent: BackgroundComponent | null = null;
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
		imageSize: [imageSize.x, imageSize.y],
		autoresize: editor.image.getAutoresizeEnabled(),
	});
	localStorage.setItem(templateKey, template);
};

// Initialize the editor's state from the template stored in localStorage.
// This must be done in a way that can be overwritten by editor.loadFrom.
const initFromTemplate = async () => {
	try {
		const defaultData = {
			imageSize: [500, 500],
			autoresize: true,
			backgroundData: {
				name: 'image-background',
				zIndex: 0,
				data: {
					mainColor: '#ffffff',
					backgroundType: BackgroundComponentBackgroundType.SolidColor,
				},
			},
		};
		const savedTemplateString = localStorage.getItem(templateKey);
		const data = savedTemplateString ? JSON.parse(savedTemplateString) : defaultData;

		if (
			'imageSize' in data &&
			typeof data['imageSize'][0] === 'number' &&
			typeof data['imageSize'][1] === 'number' &&
			isFinite(data['imageSize'][0]) &&
			isFinite(data['imageSize'][1])
		) {
			let width = data.imageSize[0];
			let height = data.imageSize[1];

			// Don't allow the template to create extremely small or extremely large images.
			const minDimension = 50;
			const maxDimension = 5000;
			width = Math.min(maxDimension, Math.max(minDimension, width));
			height = Math.min(maxDimension, Math.max(minDimension, height));

			const imageSize = Vec2.of(width, height);
			const importExportRect = new Rect2(0, 0, imageSize.x, imageSize.y);
			const addToHistory = false;
			await editor.dispatchNoAnnounce(editor.setImportExportRect(importExportRect), addToHistory);
		}

		if ('backgroundData' in data) {
			const background = AbstractComponent.deserialize(data.backgroundData);
			const addToHistory = false;
			await editor.dispatchNoAnnounce(editor.image.addElement(background), addToHistory);
		}

		if ('autoresize' in data && typeof data.autoresize === 'boolean') {
			await editor.dispatchNoAnnounce(editor.image.setAutoresizeEnabled(data.autoresize), false);
		}
	} catch (e) {
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

	doneMessageContainer.replaceChildren(messageElem, saveOptionsContainer);

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

const toSVG = () => {
	const svgElem = editor.toSVG();

	// diagrams.io has special requirements for arguments encoding.
	// Generate the container element with custom code:
	const svgText = ['<svg'];
	for (const attr of svgElem.getAttributeNames()) {
		svgText.push(` ${attr}="${escapeHtml(svgElem.getAttribute(attr)!)}"`);
	}
	svgText.push('>');
	svgText.push(svgElem.innerHTML);
	svgText.push('</svg>');

	return svgText.join('');
};

// Initial toolbar setup
const setupToolbar = (toolbarType: ToolbarType) => {
	const isEdgeToolbar = toolbarType === ToolbarType.Default || toolbarType === ToolbarType.Sidebar;
	const toolbar = isEdgeToolbar ? makeEdgeToolbar(editor) : makeDropdownToolbar(editor);

	toolbar.addDefaults();

	toolbar.addSpacer({ grow: 1, maxSize: '15px' });
	toolbar.addExitButton(() => {
		showCloseScreen();
	});

	toolbar.addSpacer({ grow: 1, maxSize: '15px' });
	toolbar.addSaveButton(() => {
		showSaveScreen();
	});

	// Save and restore toolbar state (e.g. pen colors)
	const setupToolbarStateSaveRestore = () => {
		const toolbarStateKey = 'jsdraw-toolbarState';
		editor.notifier.on(EditorEventType.ToolUpdated, () => {
			localStorage.setItem(toolbarStateKey, toolbar.serializeState());
		});

		try {
			const toolbarState = localStorage.getItem(toolbarStateKey);

			if (toolbarState) {
				toolbar.deserializeState(toolbarState);
			}
		} catch (e) {
			console.warn('Error restoring toolbar state!', e);
		}
	};
	setupToolbarStateSaveRestore();
};

initFromTemplate();

webviewApi.onMessage((message: WebViewMessage) => {
	if (message.type === 'resumeEditing') {
		editor.getRootElement().style.visibility = 'unset';
	} else {
		console.log('unknown message', message);
	}
});

let autosaveInterval: any | null = null;
const startAutosaveLoop = (delayBetweenInMS: number) => {
	if (autosaveInterval !== null) {
		clearInterval(autosaveInterval);
	}

	autosaveInterval = setInterval(async () => {
		console.log('autosaving...');
		const message: WebViewMessage = {
			type: 'autosave',
			data: toSVG(),
		};
		await webviewApi.postMessage(message);
		console.log('Done autosaving.');
	}, delayBetweenInMS);
};

// Get initial data and app settings
const loadedMessage: InitialSvgDataRequest = {
	type: 'getInitialData',
};
webviewApi.postMessage(loadedMessage).then(async (result: WebViewMessageResponse) => {
	// Don't load the image multiple times.
	if (result?.type === 'initialDataResponse' && !haveLoadedFromSvg) {
		// Update the editor's theme
		editor.getRootElement().classList.remove(lastEditorStyle);
		editor.getRootElement().classList.add(result.styleMode);
		localStorage.setItem(lastEditorStyleKey, result.styleMode);
		adjustEditorThemeForContrast(editor);

		setupToolbar(result.toolbarType);

		// Zoom to the preview region (loadFromSVG, if called, will zoom to the new region)
		const addToHistory = false;
		await editor.dispatchNoAnnounce(
			editor.viewport.zoomTo(editor.getImportExportRect()),
			addToHistory,
		);

		// If given initial data,
		if (result.initialData) {
			// We did load from an SVG
			haveLoadedFromSvg = true;

			// Clear the background
			const addToHistory = false;
			await editor.dispatchNoAnnounce(
				new Erase(editor.image.getBackgroundComponents()),
				addToHistory,
			);

			await editor.loadFromSVG(result.initialData);
		}

		// Set the autosave interval
		startAutosaveLoop(result.autosaveIntervalMS);
	}
});
