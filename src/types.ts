
export interface LoadMessage {
	type: 'loadSVG',
	data: string,
}

export interface SaveMessage {
	type: 'saveSVG',
	data: string,
}

export interface WebViewLoadedMessage {
	type: 'webviewLoaded',
}

export type WebViewMessage = SaveMessage | LoadMessage | WebViewLoadedMessage;