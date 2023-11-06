import Editor, {
	AbstractToolbar,
	BaseWidget,
	EditorEventType,
	makeDropdownToolbar,
	makeEdgeToolbar,
} from 'js-draw';
import { ToolbarType } from '../../types';
import { SettingControl } from './settings/types';

type ToolbarCallbacks = {
	onSavePress: () => void;
	onExitPress: () => void;
};

// Initial toolbar setup
const setupToolbar = (editor: Editor, callbacks: ToolbarCallbacks, settings: SettingControl) => {
	let toolbar: AbstractToolbar | null = null;
	let saveButton: BaseWidget;

	let isSaveUpToDate = false;
	let isLoading = false;

	const updateSaveButtonDisabled = () => {
		saveButton.setDisabled(isSaveUpToDate || isLoading);
	};

	const toolbarStateKey = 'jsdraw-toolbarState';
	editor.notifier.on(EditorEventType.ToolUpdated, () => {
		if (toolbar) {
			settings.updateSetting(toolbarStateKey, toolbar.serializeState());
		}
	});

	let lastKind: ToolbarType | null = null;
	const changeToolbarType = (kind: ToolbarType) => {
		if (kind === lastKind) {
			return;
		}
		lastKind = kind;

		// Clean up the previous toolbar (if any).
		toolbar?.remove();

		const isEdgeToolbar = kind === ToolbarType.Default || kind === ToolbarType.Sidebar;
		toolbar = isEdgeToolbar ? makeEdgeToolbar(editor) : makeDropdownToolbar(editor);

		toolbar.addDefaults();

		toolbar.addSpacer({ grow: 1, maxSize: '15px' });
		toolbar.addExitButton(callbacks.onExitPress);

		toolbar.addSpacer({ grow: 1, maxSize: '15px' });
		saveButton = toolbar.addSaveButton(callbacks.onSavePress);

		// Load initial toolbar state (e.g pen color/size)
		try {
			const toolbarState = settings.getSetting(toolbarStateKey);

			if (toolbarState) {
				toolbar.deserializeState(toolbarState);
			}
		} catch (e) {
			console.warn('Error restoring toolbar state!', e);
		}

		updateSaveButtonDisabled();
	};

	changeToolbarType(ToolbarType.Default);

	editor.notifier.on(EditorEventType.UndoRedoStackUpdated, () => {
		isSaveUpToDate = false;
		updateSaveButtonDisabled();
	});

	return {
		setToolbarMode: changeToolbarType,
		setSaved: () => {
			isSaveUpToDate = true;
			updateSaveButtonDisabled();
		},
		setLoading: (loading: boolean) => {
			isLoading = loading;
			updateSaveButtonDisabled();
		},
		hasUnsavedChanges: () => !isSaveUpToDate,
	};
};

export default setupToolbar;
