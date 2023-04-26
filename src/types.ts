
export interface SaveMessage {
	type: 'saveSVG',
	data: string,
}

export interface AutosaveRequest {
	type: 'autosave',
	data: string,
}

// Show the "discard changes" button
export interface ShowCloseButtonRequest {
	type: 'showCloseUnsavedBtn',
}

export interface HideCloseButtonRequest {
	type: 'hideCloseUnsavedBtn',
}

export interface ResumeEditingMessage {
	type: 'resumeEditing',
}

export interface InitialSvgDataRequest {
	type: 'getInitialData',
}

export type WebViewMessage =
	SaveMessage | ShowCloseButtonRequest | HideCloseButtonRequest | ResumeEditingMessage | InitialSvgDataRequest | AutosaveRequest;


export interface InitialDataResponse {
	type: 'initialDataResponse';

	initialData: string|undefined;
	autosaveIntervalMS: number;
}

export type WebViewMessageResponse =
	InitialDataResponse | null;
