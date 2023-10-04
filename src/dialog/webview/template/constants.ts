import { BackgroundComponentBackgroundType } from 'js-draw';

export const templateKey = 'jsdraw-image-template';

export const defaultTemplate = {
	imageSize: [500, 500],
	autoresize: true,
	backgroundData: {
		name: 'image-background',
		zIndex: 0,
		data: {
			mainColor: '#ffffff',
			backgroundType: BackgroundComponentBackgroundType.SolidColor,
		},
	},
};
