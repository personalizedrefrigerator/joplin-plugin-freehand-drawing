import joplin from 'api';
import localization from './localization';
import { SettingItemType, SettingStorage } from 'api/types';
import { EditorStyle, ToolbarType } from './types';
import AbstractDrawingView from './dialog/AbstractDrawingView';

// Joplin adds a prefix to the setting in settings.json for us.
const disableFullscreenKey = 'disable-editor-fills-window';
const autosaveIntervalKey = 'autosave-interval-minutes';
const toolbarTypeKey = 'toolbar-type';
const styleModeKey = 'style-mode';
const keyboardShortcutsKey = 'keyboard-shortcuts';

const loadSettings = async () => {
	return {
		disableFullscreen: (await joplin.settings.value(disableFullscreenKey)) satisfies boolean,
		autosaveInterval: (await joplin.settings.value(autosaveIntervalKey)) satisfies number,
		toolbarType: (await joplin.settings.value(toolbarTypeKey)) satisfies ToolbarType,
		styleMode: (await joplin.settings.value(styleModeKey)) satisfies EditorStyle,
		keyboardShortcuts: (await joplin.settings.value(keyboardShortcutsKey)) satisfies Record<
			string,
			string
		>,
	};
};

type SettingsObject = Awaited<ReturnType<typeof loadSettings>>;

const applySettingsTo = (settings: SettingsObject, drawingDialog: AbstractDrawingView) => {
	let autosaveIntervalMinutes = settings.autosaveInterval;

	// Default to two minutes.
	if (!autosaveIntervalMinutes) {
		autosaveIntervalMinutes = 2;
	}

	drawingDialog.setAutosaveInterval(autosaveIntervalMinutes * 60 * 1000);
	drawingDialog.setToolbarType(settings.toolbarType);
	drawingDialog.setStyleMode(settings.styleMode);
	drawingDialog.setKeyboardShortcuts(settings.keyboardShortcuts);
	drawingDialog.setCanFullscreen(!settings.disableFullscreen);
};

export const registerSettings = async () => {
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
				[ToolbarType.Default]: localization.toolbarTypeDefault,
				[ToolbarType.Sidebar]: localization.toolbarTypeSidebar,
				[ToolbarType.Dropdown]: localization.toolbarTypeDropdown,
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
		[disableFullscreenKey]: {
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

	let settings = await loadSettings();
	await joplin.settings.onChange(async (_event) => {
		settings = await loadSettings();
	});

	return {
		applySettingsTo: (view: AbstractDrawingView) => {
			return applySettingsTo(settings, view);
		},
	};
};
