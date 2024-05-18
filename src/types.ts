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

	ShowImagePicker = 'showImagePicker',
	GetImagePickerResult = 'getImagePicker',
	CancelImagePicker = 'cancelImagePicker',
	CleanUpImagePickerResult = 'cleanUpImagePicker',
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

export interface PickImagesRequest {
	type: MessageType.ShowImagePicker;
}

export interface GetImagePickerResultRequest {
	type: MessageType.GetImagePickerResult;
	taskId: number;
}

export interface CleanUpOrCancelPickImagesRequest {
	type: MessageType.CancelImagePicker | MessageType.CleanUpImagePickerResult;
	taskId: number;
}

export type WebViewMessage =
	| SaveMessage
	| AutosaveMesssage
	| SetSaveMethodMessage
	| SaveCompletedMessage
	| ShowSaveAndCloseButtonMessage
	| ShowCloseButtonMessage
	| HideButtonsMessage
	| InitialSvgDataRequest
	| PickImagesRequest
	| GetImagePickerResultRequest
	| CleanUpOrCancelPickImagesRequest;

export enum ResponseType {
	InitialDataResponse = 'initialDataResponse',
	SaveResponse = 'saveResponse',
	ImagePickerTaskResponse = 'imagePickerStartedResponse',
	ImagePickerResponse = 'imagePickerResponse',
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

export interface TransferableImageData {
	path: string;
	name: string;
	mime?: string;
}

export interface ImagePickerStartedResponse {
	type: ResponseType.ImagePickerTaskResponse;
	taskId: number;
}

export interface ImagePickerResponse {
	type: ResponseType.ImagePickerResponse;
	images: TransferableImageData[] | null;
}

export type WebViewMessageResponse =
	| InitialDataResponse
	| SaveResponse
	| ImagePickerStartedResponse
	| ImagePickerResponse
	| true;

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
