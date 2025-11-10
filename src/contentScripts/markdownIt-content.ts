import localization, { setLocale } from 'src/localization';
import { markdownItContentScriptId } from '../constants';
import makeImageEditable from './utils/makeImageEditable';

declare const webviewApi: any;

let initLocalePromise: Promise<void> | null = null;
// Responsible for fetching the locale data from the main process.
const initLocale = async () => {
	if (initLocalePromise) {
		return initLocalePromise;
	}

	// Avoid fetching the same data multiple times.
	const promise = (async () => {
		const languages = await webviewApi.postMessage(markdownItContentScriptId, 'get-locale:');
		if (!Array.isArray(languages)) {
			throw new Error(
				`Invalid locale request response. Not an array: ${JSON.stringify(languages)}`,
			);
		}
		setLocale(languages);
	})();
	initLocalePromise = promise;

	return promise;
};

const processImages = () => {
	const images = document.querySelectorAll<HTMLImageElement>('img[src*=".svg"]');
	for (const image of images) {
		if (image.src.match(/^https?:/) || !image.src.match(/[a-z0-9]{32}[.]svg([?]t=\d+)?$/)) {
			continue;
		}

		makeImageEditable(
			image,
			(async () => {
				await initLocale();
				return localization.edit;
			})(),
		);
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	processImages();
});

processImages();
