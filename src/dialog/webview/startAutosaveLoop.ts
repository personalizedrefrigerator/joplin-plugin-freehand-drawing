import Editor from 'js-draw';
import type { PostMessageCallback } from './types';
import { MessageType } from '../../types';
import svgElementToString from './svgElementToString';

const startAutosaveLoop = async (
	editor: Editor,
	delayBetweenInMS: number,
	postMessage: PostMessageCallback,
) => {
	while (true) {
		await new Promise((resolve) => {
			setTimeout(resolve, delayBetweenInMS);
		});

		const savedImage = await editor.toSVGAsync();
		await postMessage({
			type: MessageType.AutosaveSVG,
			data: svgElementToString(savedImage),
		});
	}
};

export default startAutosaveLoop;
