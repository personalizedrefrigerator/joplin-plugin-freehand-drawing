
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


export enum ToolbarType {
	Default = 0,
	Sidebar = 1,
	Dropdown = 2,
}

export enum EditorStyle {
	MatchJoplin = 'match-joplin-theme',
	JsDrawLight = 'js-draw-default-light',
	JsDrawDark = 'js-draw-default-dark',
}

export interface InitialDataResponse {
	type: 'initialDataResponse';

	initialData: string|undefined;
	autosaveIntervalMS: number;
	toolbarType: ToolbarType;
	styleMode: EditorStyle;
}

export type WebViewMessageResponse =
	InitialDataResponse | null;


