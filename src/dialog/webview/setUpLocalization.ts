import { setLocale } from '../../localization';

const getLocaleInfo = () => {
	// In some cases, the locale information is provided through a hidden element
	const localeInfoFromElement = document.querySelector<HTMLInputElement>(
		'input#default-locale-data',
	)?.value;
	return localeInfoFromElement;
};

(() => {
	let localeInfo = getLocaleInfo();
	if (!localeInfo) {
		console.warn('Locale information not found');
		localeInfo = 'unknown';
	}
	setLocale([localeInfo, ...navigator.languages]);
})();
