import makeImageEditable from './utils/makeImageEditable';

const processImages = () => {
	const editableImageContainers = document.querySelectorAll<HTMLElement>(
		'*[data-js-draw-source-content-script-id]',
	);
	for (const container of editableImageContainers) {
		const contentScriptId = container.getAttribute('data-js-draw-source-content-script-id')!;
		makeImageEditable(container, contentScriptId);
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	processImages();
});

processImages();
