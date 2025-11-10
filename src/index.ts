import joplin from 'api';
import { ContentScriptType, MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { clearAutosave, getAutosave } from './autosave';
import localization, { getLocales, setLocale } from './localization';
import TemporaryDirectory from './TemporaryDirectory';
import DrawingDialog from './dialog/DrawingDialog';
import { markdownItContentScriptId, pluginPrefix } from './constants';
import DrawingWindow from './dialog/DrawingWindow';
import { registerSettings } from './settings';
import DrawingManager from './DrawingManager';

joplin.plugins.register({
	onStart: async function () {
		// Initialize `localizations` from Joplin's global locale -- navigator.localizations
		// does not necessarily match the Joplin locale.
		setLocale(await joplin.settings.globalValue('locale'));

		const tmpdir = await TemporaryDirectory.create();

		const settings = await registerSettings();
		const dialogManager = new DrawingManager(
			tmpdir,
			() => DrawingDialog.create(tmpdir),
			settings.applySettingsTo,
		);
		// Manages creating/inserting drawings in new windows
		const drawingWindowManager = new DrawingManager(
			tmpdir,
			() => new DrawingWindow(tmpdir),
			settings.applySettingsTo,
		);

		const editInSameWindowCommand = `${pluginPrefix}insertDrawing`;
		await joplin.commands.register({
			name: editInSameWindowCommand,
			label: localization.insertDrawing,
			enabledCondition: 'oneNoteSelected && !noteIsReadOnly',
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				await dialogManager.editOrInsertDrawing();
			},
		});

		const editInNewWindowCommand = `${pluginPrefix}insertDrawing__newWindow`;
		await joplin.commands.register({
			name: editInNewWindowCommand,
			label: localization.insertDrawingInNewWindow,
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				await drawingWindowManager.editOrInsertDrawing();
			},
		});

		await joplin.views.toolbarButtons.create(
			editInSameWindowCommand,
			editInSameWindowCommand,
			ToolbarButtonLocation.EditorToolbar,
		);

		// Add to the edit menu. This allows users to assign a custom keyboard shortcut to the action.
		const toolMenuInsertDrawingButtonId = `${pluginPrefix}insertDrawingToolMenuBtn`;
		await joplin.views.menuItems.create(
			toolMenuInsertDrawingButtonId,
			editInSameWindowCommand,
			MenuItemLocation.Edit,
		);

		const restoreAutosaveCommand = `${pluginPrefix}restoreAutosave`;
		const deleteAutosaveCommand = `${pluginPrefix}deleteAutosave`;
		await joplin.commands.register({
			name: restoreAutosaveCommand,
			label: localization.restoreFromAutosave,
			iconName: 'fas fa-floppy-disk',
			execute: async () => {
				const svgData = await getAutosave();

				if (!svgData) {
					await joplin.views.dialogs.showMessageBox(localization.noSuchAutosaveExists);
					return;
				}

				await dialogManager.insertNewDrawing(svgData);
			},
		});
		await joplin.commands.register({
			name: deleteAutosaveCommand,
			label: localization.deleteAutosave,
			iconName: 'fas fa-trash-can',
			execute: async () => {
				await clearAutosave();
			},
		});

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			markdownItContentScriptId,
			'./contentScripts/markdownIt.js',
		);
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (action: string) => {
			if (action.startsWith('edit:')) {
				const resourceUrl = action.replace(/^edit:/, '');
				return (await dialogManager.editDrawing(resourceUrl, { allowSaveAsCopy: true }))
					?.resourceId;
			} else if (action === 'get-locale:') {
				return getLocales();
			}
			console.warn('Unknown action', action);
			return null;
		});

		const codeMirrorContentScriptId = 'jsdraw__codeMirrorContentScriptId';
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			codeMirrorContentScriptId,
			'./contentScripts/codeMirror.js',
		);
	},
});
