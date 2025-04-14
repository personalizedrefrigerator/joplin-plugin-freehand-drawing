import localization from '../../localization';

declare const webviewApi: any;

const makeImageEditable = (container: HTMLElement, contentScriptId: string) => {
	const image = container.querySelector('img');
	if (!image) {
		console.warn('Freehand drawing plugin: No image found in container.');
		return;
	}
	if (container.classList.contains('js-draw--editable')) {
		// Already processed?
		return;
	}

	container.classList.add('js-draw--editable');

	const onEdit = () => {
		const message = image.src;
		webviewApi.postMessage(contentScriptId, message).catch((err: any) => {
			console.error('Error posting message!', err, '\nMessage: ', message);
		});
	};

	const addEditButton = () => {
		const editButton = document.createElement('button');
		editButton.textContent = `${localization.edit} 🖊️`;
		editButton.classList.add('jsdraw--editButton');
		container.appendChild(editButton);

		editButton.onclick = () => {
			onEdit();
		};
	};

	const isRichTextEditor = document.body?.id === 'tinymce';
	if (!isRichTextEditor) {
		addEditButton();
	} else {
		image.style.cursor = 'pointer';
	}

	image.ondblclick = onEdit;
};

export default makeImageEditable;
