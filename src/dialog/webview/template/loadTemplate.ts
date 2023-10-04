import Editor, { AbstractComponent, Rect2, Vec2 } from 'js-draw';
import { SettingControl } from '../settings/types';
import { defaultTemplate, templateKey } from './constants';

// Initialize the editor's state from the template stored in localStorage.
// This must be done in a way that can be overwritten by editor.loadFrom.
const loadTemplate = async (editor: Editor, settings: SettingControl) => {
	try {
		const savedTemplateString = settings.getSetting(templateKey);
		const data = savedTemplateString ? JSON.parse(savedTemplateString) : defaultTemplate;

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

export default loadTemplate;
