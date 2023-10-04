import Editor, { BackgroundComponent } from 'js-draw';
import { SettingControl } from '../settings/types';
import { templateKey } from './constants';

// Update the template for new images based on the current state of the editor
const saveStateAsTemplate = (editor: Editor, settings: SettingControl) => {
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
	settings.updateSetting(templateKey, template);
};

export default saveStateAsTemplate;
