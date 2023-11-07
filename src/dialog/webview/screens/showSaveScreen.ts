// Returns false if save screen is shown, true if saved

import { MessageType, ResponseType, SaveMessage, SaveMethod } from '../../../types';
import localization from '../../../localization';
import { EditorControl } from '../makeJsDrawEditor';
import { PostMessageCallback } from '../types';
import svgElementToString from '../svgElementToString';

// without the need for a screen.
const showSaveScreen = async (
	editorControl: EditorControl | null,
	postMessageCallback: PostMessageCallback,
) => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	const saveMessage: SaveMessage = {
		type: MessageType.SaveSVG,
		data: svgElementToString(editor.toSVG()),
	};
	const response = await postMessageCallback({ ...saveMessage });
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
		await postMessageCallback({ type: MessageType.HideButtons });
	};

	const resumeEditingButton = document.createElement('button');
	resumeEditingButton.innerText = localization.saveAndResumeEditing;
	resumeEditingButton.onclick = async () => {
		await hideSaveScreen();
		await postMessageCallback({ ...saveMessage });
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
				await postMessageCallback({
					type: MessageType.SetSaveMethod,
					method: value,
				});
			}
		};

		onUpdate();
		inputElem.oninput = onUpdate;
	};

	addSaveOption(localization.overwriteExisting, SaveMethod.Overwrite, true);
	addSaveOption(localization.saveAsNewDrawing, SaveMethod.SaveAsNew);

	const messageElem = document.createElement('div');
	messageElem.innerText = localization.clickBelowToContinue;

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('button-container');
	buttonContainer.replaceChildren(resumeEditingButton);

	dialogContainer.replaceChildren(messageElem, saveOptionsContainer, buttonContainer);

	document.body.appendChild(dialogContainer);
	return false;
};

export default showSaveScreen;
