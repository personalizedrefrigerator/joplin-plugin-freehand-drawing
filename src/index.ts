import joplin from 'api';
import { ContentScriptType, DialogResult, MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { autosave, clearAutosave, getAutosave } from './autosave';
import localization from './localization';
import Resource from './Resource';
import TemporaryDirectory from './TemporaryDirectory';
import { WebViewMessage } from './types';
import waitFor from './util/waitFor';

// While learning how to use the Joplin plugin API,
// * https://github.com/herdsothom/joplin-insert-date/blob/main/src/index.ts
// * and https://github.com/marc0l92/joplin-plugin-drawio
// were both wonderful references.

const dialogs = joplin.views.dialogs;

// [dialog]: A handle to the dialog
const initDrawingDialog = async (dialog: string) => {
	// Sometimes, the dialog doesn't load properly.
	// Add a cancel button to hide it and try loading again.
	await dialogs.setButtons(dialog, [{ id: 'cancel' }]);
	await dialogs.setHtml(dialog, '');
	await dialogs.addScript(dialog, './dialog/webview.js');
	await dialogs.addScript(dialog, './dialog/webview.css');
	await dialogs.setFitToContent(dialog, false);
};

type SaveOptionType = 'saveAsCopy' | 'overwrite';

// Returns SVG data for a drawing
const promptForDrawing = async (dialogHandle: string, initialData?: string): Promise<[string, SaveOptionType]> => {
	await initDrawingDialog(dialogHandle);

	const result = new Promise<[string, SaveOptionType]>((resolve, reject) => {
		let saveData: string|null = null;
		joplin.views.panels.onMessage(dialogHandle, (message: WebViewMessage) => {
			if (message.type === 'saveSVG') {
				saveData = message.data;
				void dialogs.setButtons(dialogHandle, [{
					id: 'ok',
				}]);
			} else if (message.type === 'getInitialData') {
				// The drawing dialog has loaded -- we don't need the exit button.
				void dialogs.setButtons(dialogHandle, []);

				return initialData;
			} else if (message.type === 'showCloseUnsavedBtn') {
				void dialogs.setButtons(dialogHandle, [{
					id: 'cancel',
					title: localization.discardChanges,
				}]);
			} else if (message.type === 'hideCloseUnsavedBtn') {
				void dialogs.setButtons(dialogHandle, []);
			} else if (message.type === 'autosave') {
				void clearAutosave().then(() => {
					void autosave(message.data);
				});
			}
		});

		dialogs.open(dialogHandle).then((result: DialogResult) => {
			if (saveData && result.id === 'ok') {
				const saveOption: SaveOptionType = result.formData?.saveOptions?.saveOption ?? 'saveAsCopy';
				resolve([ saveData, saveOption ]);
			} else if (result.id === 'cancel') {
				reject('Canceled by user.');
			} else {
				reject(`Unknown button ID ${result.id}`);
			}
		});
	});
	return await result;
};

// Returns true if the CodeMirror editor is active.
const isMarkdownEditor = async () => {
	return await joplin.commands.execute('editor.execCommand', {
		name: 'js-draw--isCodeMirrorActive',
	}) === 'active';
};

const saveRichTextEditorSelection = async () => {
	// For saving the selection if switching between editors.
	// We want the selection placeholder to be able to compile to a regular expression. Avoid
	// non-alphanumeric characters.
	const selectionPointIdText = `placeholderid${Math.random()}${Math.random()}`.replace(/[.]/g, 'x');

	await joplin.commands.execute('editor.execCommand', {
		name: 'mceInsertContent',
		value: selectionPointIdText,
	});

	return selectionPointIdText;
};

const pluginPrefix = 'jop-freehand-drawing-jsdraw-plugin-';

joplin.plugins.register({
	onStart: async function() {
		const drawingDialog = await dialogs.create(`${pluginPrefix}jsDrawDialog`);
		const tmpdir = await TemporaryDirectory.create();

		const insertNewDrawing = async (svgData: string, richTextEditorSelectionData?: string) => {
			const resource = await Resource.ofData(tmpdir, svgData, localization.defaultImageTitle, '.svg');
			const wasMarkdownEditor = await isMarkdownEditor();


			// MCE or Joplin has a bug where inserting markdown code for an SVG image removes
			// the image data. See https://github.com/laurent22/joplin/issues/7547.
			if (!wasMarkdownEditor) {
				// Switch to the markdown editor.
				await joplin.commands.execute('toggleEditors');

				// Delay: Ensure we're really in the CodeMirror editor.
				await waitFor(100);

				// Jump to the rich text editor selection
				const selectPlaceholderResult = await joplin.commands.execute('editor.execCommand', {
					name: 'js-draw--cmSelectAndDelete',
					args: [ richTextEditorSelectionData ],
				});
				console.log('js-draw: CodeMirror select placeholder result', selectPlaceholderResult);
			}

			const textToInsert = `![${resource.htmlSafeTitle()}](:/${resource.resourceId})`;
			await joplin.commands.execute('insertText', textToInsert);

			// Try to switch back to the original editor
			if (!wasMarkdownEditor) {
				await joplin.commands.execute('toggleEditors');
			}
		};

		const editDrawing = async (resourceUrl: string): Promise<Resource|null> => {
			const expectedMime = 'image/svg+xml';
			const resource = await Resource.fromURL(tmpdir, resourceUrl, '.svg', expectedMime);

			if (resource.mime !== expectedMime) {
				alert(localization.notAnEditableImage(resourceUrl, resource.mime));
				return null;
			}

			const [ updatedData, saveOption ] = await promptForDrawing(drawingDialog, await resource.getDataAsString());

			if (saveOption === 'overwrite') {
				console.log('Image editor: Overwriting resource...');
				await resource.updateData(updatedData);
			} else {
				console.log('Image editor: Inserting new drawing...');
				await insertNewDrawing(updatedData);
			}

			return resource;
		};

		const toolbuttonCommand = `${pluginPrefix}insertDrawing`;

		await joplin.commands.register({
			name: toolbuttonCommand,
			label: localization.insertDrawing,
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				const selection = await joplin.commands.execute('selectedText');

				// If selecting a resource URL, edit that. Else, insert a new drawing.
				if (selection && /^\:\/[a-zA-Z0-9]+$/.exec(selection)) {
					console.log('Attemptint to edit selected resource,', selection);

					// TODO: Update the cache-breaker for the resource.
					await editDrawing(selection);
				} else {
					const selectionData = await saveRichTextEditorSelection();
					const [ svgData, _saveOption ] = await promptForDrawing(drawingDialog);
					await insertNewDrawing(svgData, selectionData);
				}
			},
		});

		await joplin.views.toolbarButtons.create(
			toolbuttonCommand, toolbuttonCommand, ToolbarButtonLocation.EditorToolbar
		);

		// Add to the edit menu. This allows users to assign a custom keyboard shortcut to the action.
		const toolMenuInsertDrawingButtonId = `${pluginPrefix}insertDrawingToolMenuBtn`;
		await joplin.views.menuItems.create(toolMenuInsertDrawingButtonId, toolbuttonCommand, MenuItemLocation.Edit);

		const restoreAutosaveCommand = `${pluginPrefix}restoreAutosave`;
		const deleteAutosaveCommand = `${pluginPrefix}deleteAutosave`;
		await joplin.commands.register({
			name: restoreAutosaveCommand,
			label: localization.restoreFromAutosave,
			iconName: 'fas fa-floppy-disk',
			execute: async () => {
				const svgData = await getAutosave();

				if (!svgData) {
					await joplin.views.dialogs.showMessageBox(
						localization.noSuchAutosaveExists,
					);
					return;
				}

				await insertNewDrawing(svgData);
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

		const markdownItContentScriptId = 'jsdraw__markdownIt_editDrawingButton';
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			markdownItContentScriptId,
			'./contentScripts/markdownIt.js',
		);

		const codeMirrorContentScriptId = 'jsdraw__codeMirrorContentScriptId';
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			codeMirrorContentScriptId,
			'./contentScripts/codeMirror.js'
		);
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (resourceUrl: string) => {
			return (await editDrawing(resourceUrl))?.resourceId;
		});
	},
});
