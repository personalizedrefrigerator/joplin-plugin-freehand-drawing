import joplin from 'api';
import localization from './localization';
import { SettingItemType, SettingStorage } from 'api/types';
import { EditorStyle, ToolbarType } from './types';
import AbstractDrawingView from './dialog/AbstractDrawingView';
import DrawingDialog from './dialog/DrawingDialog';

// Joplin adds a prefix to the setting in settings.json for us.
const editorFillsWindowKey = 'disable-editor-fills-window';
const autosaveIntervalKey = 'autosave-interval-minutes';
const toolbarTypeKey = 'toolbar-type';
const styleModeKey = 'style-mode';
const keyboardShortcutsKey = 'keyboard-shortcuts';

export const applySettingsTo = async (drawingDialog: AbstractDrawingView) => {
	let autosaveIntervalMinutes = await joplin.settings.value(autosaveIntervalKey);

	// Default to two minutes.
	if (!autosaveIntervalMinutes) {
		autosaveIntervalMinutes = 2;
	}

	await drawingDialog.setAutosaveInterval(autosaveIntervalMinutes * 60 * 1000);

	const toolbarType = (await joplin.settings.value(toolbarTypeKey)) as ToolbarType;
	drawingDialog.setToolbarType(toolbarType);

	const styleMode = (await joplin.settings.value(styleModeKey)) as EditorStyle;
	drawingDialog.setStyleMode(styleMode);

	drawingDialog.setKeyboardShortcuts(await joplin.settings.value(keyboardShortcutsKey));
};

export const registerAndApplySettings = async (drawingDialog: DrawingDialog) => {
	const jsDrawSectionName = 'js-draw';
	await joplin.settings.registerSection(jsDrawSectionName, {
		label: 'Freehand Drawing',
		iconName: 'fas fa-pen-alt',
		description: localization.settingsPaneDescription,
	});

	// Editor fullscreen setting
	await joplin.settings.registerSettings({
		[toolbarTypeKey]: {
			public: true,
			section: jsDrawSectionName,
			advanced: true,

			label: localization.setting__toolbarTypeLabel,
			description: localization.setting__toolbarTypeDescription,

			isEnum: true,
			type: SettingItemType.Int,
			value: 0,

			options: {
				0: localization.toolbarTypeDefault,
				1: localization.toolbarTypeSidebar,
				2: localization.toolbarTypeDropdown,
			},
		},
		[styleModeKey]: {
			public: true,
			section: jsDrawSectionName,

			label: localization.setting__themeLabel,

			isEnum: true,
			type: SettingItemType.String,
			value: EditorStyle.MatchJoplin,

			options: {
				[EditorStyle.MatchJoplin]: localization.styleMatchJoplin,
				[EditorStyle.JsDrawLight]: localization.styleJsDrawLight,
				[EditorStyle.JsDrawDark]: localization.styleJsDrawDark,
			},
		},
		[editorFillsWindowKey]: {
			public: true,
			section: jsDrawSectionName,
			advanced: true,

			label: localization.setting__disableFullScreen,
			description: localization.setting__disableFullScreenDescription,
			storage: SettingStorage.File,

			type: SettingItemType.Bool,
			value: false,
		},
		[autosaveIntervalKey]: {
			public: true,
			section: jsDrawSectionName,
			advanced: true,

			label: localization.setting__autosaveIntervalSettingLabel,
			description: localization.setting__autosaveIntervalSettingDescription,
			storage: SettingStorage.File,

			type: SettingItemType.Int,
			value: 2,
		},
		[keyboardShortcutsKey]: {
			public: false,
			section: jsDrawSectionName,

			label: localization.setting__keyboardShortcuts,
			storage: SettingStorage.File,

			type: SettingItemType.Object,
			value: {},
		},
	});

	const applySettings = async () => {
		const fullscreenDisabled = await joplin.settings.value(editorFillsWindowKey);
		await drawingDialog.setCanFullscreen(!fullscreenDisabled);
		applySettingsTo(drawingDialog);
	};

	await joplin.settings.onChange((_event) => {
		void applySettings();
	});

	await applySettings();
};
