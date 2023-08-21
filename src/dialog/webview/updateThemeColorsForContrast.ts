import { Color4, Editor } from 'js-draw';

// Updates the default theme colors applied to the editor if necessary for accessibility.
const updateThemeColorsForContrast = (editor: Editor) => {
	const editorElem = editor.getRootElement();

	// Each set of entries in colorPairs should resolve to colors with sufficient
	// contrast.
	const colorPairs: [string, string][] = [
		[ '--background-color-1', '--foreground-color-1'],
		[ '--background-color-2', '--foreground-color-2'],
		[ '--background-color-3', '--foreground-color-3'],
		[ '--selection-background-color', '--selection-foreground-color'],
	];


	const styles = getComputedStyle(editorElem);

	const fallbackForeground = '--foreground-color-1';

	const getContrast = (varName1: string, varName2: string) => {
		const color1 = Color4.fromString(styles.getPropertyValue(varName1));
		const color2 = Color4.fromString(styles.getPropertyValue(varName2));

		// Estimate the contrast.
		// TODO: Use luminance and calculate the contrast as here:
		// https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
		const color1Grayscale = (color1.r + color1.g + color1.b) / 3;
		const color2Grayscale = (color2.r + color2.g + color2.b) / 3;

		const contrast = (Math.max(color2Grayscale, color1Grayscale) + 0.05) / (Math.min(color2Grayscale, color1Grayscale) + 0.05);
		return contrast;
	}

	for (const [ backgroundVar, foregroundVar ] of colorPairs) {
		const currentContrast = getContrast(backgroundVar, foregroundVar);
		const replacementContrast = getContrast(backgroundVar, fallbackForeground);

		if (currentContrast < 2.7 && replacementContrast > currentContrast) {
			editorElem.style.setProperty(foregroundVar, `var(${fallbackForeground})`);
		}
	}
};

export default updateThemeColorsForContrast;
