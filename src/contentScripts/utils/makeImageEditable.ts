declare const webviewApi: any;

// Note: For now, makeImageEditable should avoid using imported functions.
// To support old Joplin versions, it should be possible to convert makeImageEditable
// to a string.
const makeImageEditable = (container: HTMLElement) => {
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

	const editLabel = container.getAttribute('data-js-draw-edit-label');
	const contentScriptId = container.getAttribute('data-js-draw-content-script-id');

	const onEdit = () => {
		const message = image.src;
		webviewApi.postMessage(contentScriptId, message).catch((err: any) => {
			console.error('Error posting message!', err, '\nMessage: ', message);
		});
	};

	const addEditButton = () => {
		const editButton = document.createElement('button');
		editButton.textContent = `${editLabel} 🖊️`;
		editButton.classList.add('jsdraw--editButton');
		container.appendChild(editButton);

		editButton.onclick = () => {
			onEdit();
		};
	};

	const isRichTextEditor =
		document.body.classList.contains('mce-content-body') || document.body.id === 'tinymce';
	const hasWebViewApi = typeof webviewApi !== 'undefined';

	if (isRichTextEditor) {
		image.style.cursor = 'pointer';
	} else if (hasWebViewApi) {
		// Don't show the edit button e.g. in exported HTML.
		addEditButton();
	}

	image.ondblclick = onEdit;
};

export default makeImageEditable;
