import { WebViewMessage, WebViewMessageResponse } from '../../types';

export type PostMessageCallback = (message: WebViewMessage) => Promise<WebViewMessageResponse>;

export type EditorSaveExitCallbacks = {
	onSave: () => void;
	onExit: () => void;
};
