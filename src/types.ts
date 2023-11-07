export enum MessageType {
	GetInitialData = 'getInitialData',
	SaveSVG = 'saveSVG',
	SaveCompleted = 'saveCompleted',
	AutosaveSVG = 'autosaveSVG',
	SetSaveMethod = 'setSaveMethod',
	ResumeEditing = 'resumeEditing',
	ShowSaveAndCloseButton = 'showSaveAndCloseButton',
	ShowCloseButton = 'showCloseButton',
	HideButtons = 'removeButtons',
}

export enum SaveMethod {
	SaveAsNew = 'saveAsNew',
	Overwrite = 'overwrite',
}

export interface SaveMessage {
	type: MessageType.SaveSVG;
	data: string;
}

export interface SaveCompletedMessage {
	type: MessageType.SaveCompleted;
}

export interface AutosaveMesssage {
	type: MessageType.AutosaveSVG;
	data: string;
}

export interface SetSaveMethodMessage {
	type: MessageType.SetSaveMethod;
	method: SaveMethod;
}

// Show the "discard changes" button
export interface ShowSaveAndCloseButtonMessage {
	type: MessageType.ShowSaveAndCloseButton;
	saveData: string;
}

export interface ShowCloseButtonMessage {
	type: MessageType.ShowCloseButton;
	isSaved: boolean;
}

export interface HideButtonsMessage {
	type: MessageType.HideButtons;
}

export interface InitialSvgDataRequest {
	type: MessageType.GetInitialData;
}

export type WebViewMessage =
	| SaveMessage
	| AutosaveMesssage
	| SetSaveMethodMessage
	| SaveCompletedMessage
	| ShowSaveAndCloseButtonMessage
	| ShowCloseButtonMessage
	| HideButtonsMessage
	| InitialSvgDataRequest;

export enum ResponseType {
	InitialDataResponse = 'initialDataResponse',
	SaveResponse = 'saveResponse',
}

export interface InitialDataResponse {
	type: ResponseType.InitialDataResponse;

	initialData: string | undefined;
	autosaveIntervalMS: number;
	toolbarType: ToolbarType;
	styleMode: EditorStyle;
	keyboardShortcuts: KeybindingRecord;
}

// Response to a save request
export interface SaveResponse {
	type: ResponseType.SaveResponse;

	waitingForSaveType: boolean;
}

export type WebViewMessageResponse = InitialDataResponse | SaveResponse | true;

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

export type KeybindingRecord = Record<string, string[]>;
