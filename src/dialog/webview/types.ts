import type { TransferableImageData, WebViewMessage, WebViewMessageResponse } from '../../types.ts';

export type PostMessageCallback = (message: WebViewMessage) => Promise<WebViewMessageResponse>;

export type LoadImageTask = {
	cancel: () => void;
	cleanUp: () => void;
	images: Promise<TransferableImageData[] | null>;
};

export type EditorCallbacks = {
	onSave: () => void;
	onExit: () => void;

	showImagePicker: () => Promise<LoadImageTask>;
};
