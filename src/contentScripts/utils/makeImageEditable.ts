import { markdownItContentScriptId } from '../../constants';

declare const webviewApi: any;

const hasFocus = (element: HTMLElement) => {
	return element.contains(document.activeElement);
};

const onEdit = (image: Event | HTMLElement) => {
	if (!(image instanceof HTMLElement)) {
		image = image.currentTarget as HTMLElement;
	}

	const message = `edit:${image.getAttribute('src')}`;
	webviewApi.postMessage(markdownItContentScriptId, message).catch((err: any) => {
		console.error('Error posting message!', err, '\nMessage: ', message);
	});
};

// Note: For now, makeImageEditable should avoid using imported functions.
// To support old Joplin versions, it should be possible to convert makeImageEditable
// to a string.
const makeImageEditable = (image: HTMLImageElement, editLabel: Promise<string>) => {
	if (image.classList.contains('js-draw--skip')) return;
	// Already processed?
	// Workaround: Use .ondblclick to determine processing state. Storing other non-event-listener
	// properties on the image when the Rich Text Editor is active results in those properties being
	// saved as a part of the note.
	if (image.ondblclick === onEdit) return;
	image.ondblclick = onEdit;

	const addEditButton = () => {
		const editButtonContainer = document.createElement('span');

		const editButton = document.createElement('button');
		const updateLabel = (label: string) => {
			editButton.textContent = `${label} 🖊️`;
		};

		editButton.ariaDescribedByElements = [image];
		editButtonContainer.classList.add('jsdraw--editButton');
		editButtonContainer.appendChild(editButton);

		updateLabel('Edit');
		void (async () => {
			updateLabel(await editLabel);
		})();

		image.insertAdjacentElement('afterend', editButtonContainer);

		const pointerSet = new Set();
		const updateVisibleState = () => {
			const show =
				pointerSet.size > 0 ||
				editButton.querySelector(':hover, :focus') ||
				hasFocus(editButton) ||
				hasFocus(image);
			if (show) {
				editButtonContainer.classList.add('-show');
			} else {
				editButtonContainer.classList.remove('-show');
			}
		};
		const updatePositioning = () => {
			const containerBox = editButtonContainer.getBoundingClientRect();
			const imageBox = image.getBoundingClientRect();
			editButton.style.right = `${imageBox.right - containerBox.right}px`;
			editButton.style.top = `${imageBox.top - containerBox.top}px`;
		};

		image.addEventListener('pointerenter', (event) => {
			pointerSet.add(event.pointerId);
			updateVisibleState();
			updatePositioning();
		});
		image.addEventListener('pointerout', (event) => {
			pointerSet.delete(event.pointerId);
			updateVisibleState();
		});
		for (const item of [image, editButton]) {
			item.addEventListener('focus', () => {
				updateVisibleState();
				updatePositioning();
			});
			item.addEventListener('blur', () => {
				// Allow the event to propegate: Handle the case where the user
				// tabs from the image to the edit button.
				requestAnimationFrame(() => {
					updateVisibleState();
				});
			});
		}

		editButton.onclick = () => {
			onEdit(image);
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
};

export default makeImageEditable;
