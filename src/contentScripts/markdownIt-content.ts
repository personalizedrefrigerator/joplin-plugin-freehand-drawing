import makeImageEditable from './utils/makeImageEditable';

const processImages = () => {
	const editableImageContainers = document.querySelectorAll<HTMLElement>(
		'*[data-js-draw-content-script-id]',
	);
	for (const container of editableImageContainers) {
		makeImageEditable(container);
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	processImages();
});

processImages();
