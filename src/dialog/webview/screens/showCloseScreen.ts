import { MessageType } from '../../../types.ts';
import localization from '../../../localization.ts';
import { EditorControl } from '../makeJsDrawEditor.ts';
import { PostMessageCallback } from '../types.ts';
import showSaveScreen from './showSaveScreen.ts';

type AddSaveCompletedListenerCallback = (listener: () => void) => void;

const showCloseScreen = (
	editorControl: EditorControl | null,
	postMessageCallback: PostMessageCallback,
	addSaveCompletedListener: AddSaveCompletedListenerCallback,
) => {
	if (!editorControl) {
		return;
	}

	const editor = editorControl.editor;
	postMessageCallback({
		type: MessageType.ShowCloseButton,
		isSaved: !editorControl.hasUnsavedChanges(),
	});

	editor.getRootElement().style.display = 'none';

	const dialogContainer = document.createElement('div');
	dialogContainer.classList.add('save-or-exit-dialog');

	const hideExitScreen = async () => {
		editor.getRootElement().style.display = '';
		dialogContainer.remove();
		await postMessageCallback({ type: MessageType.HideButtons });
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
			addSaveCompletedListener(() => resolve());
		});
		const saved = await showSaveScreen(editorControl, postMessageCallback);

		if (saved) {
			await saveCompletedListener;
			showCloseScreen(editorControl, postMessageCallback, addSaveCompletedListener);
		}
	};

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('button-container');
	buttonContainer.replaceChildren(resumeEditingBtn, saveChangesButton);

	dialogContainer.replaceChildren(message, buttonContainer);
	document.body.appendChild(dialogContainer);

	saveChangesButton.focus();
};

export default showCloseScreen;
