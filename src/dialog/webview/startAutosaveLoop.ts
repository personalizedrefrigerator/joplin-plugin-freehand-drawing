import { Editor } from 'js-draw';
import type { PostMessageCallback } from './types.ts';
import { MessageType } from '../../types.ts';
import svgElementToString from './svgElementToString.ts';

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
