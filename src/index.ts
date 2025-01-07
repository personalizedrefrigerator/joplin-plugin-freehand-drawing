import joplin from 'api';
import { ContentScriptType, MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { clearAutosave, getAutosave } from './autosave';
import localization from './localization';
import Resource from './Resource';
import TemporaryDirectory from './TemporaryDirectory';
import waitFor from './util/waitFor';
import DrawingDialog from './dialog/DrawingDialog';
import { pluginPrefix } from './constants';
import { SaveMethod } from './types';
import isVersionGreater from './util/isVersionGreater';
import DrawingWindow from './dialog/DrawingWindow';
import AbstractDrawingView from './dialog/AbstractDrawingView';
import { applySettingsTo, registerAndApplySettings } from './settings';

// While learning how to use the Joplin plugin API,
// * https://github.com/herdsothom/joplin-insert-date/blob/main/src/index.ts
// * and https://github.com/marc0l92/joplin-plugin-drawio
// were both wonderful references.

// Returns true if the CodeMirror editor is active.
const isMarkdownEditor = async () => {
	return (
		(await joplin.commands.execute('editor.execCommand', {
			name: 'js-draw--isCodeMirrorActive',
		})) === 'active'
	);
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

const needsToSwitchEditorsBeforeInsertingText = async () => {
	// Newer versions of Joplin don't have the bug that required switching editors
	// before inserting text.
	const version = await joplin.versionInfo();
	return !isVersionGreater(version.version, '2.13.4') && !(await isMarkdownEditor());
};

/**
 * Inserts `textToInsert` at the point of current selection, **or**, if `richTextEditorSelectionMarker`
 * is given and the rich text editor is currently open, replaces `richTextEditorSelectionMarker` with
 * `textToInsert`.
 *
 * `richTextEditorSelectionMarker` works around a bug in the rich text editor. See
 * https://github.com/laurent22/joplin/issues/7547
 */
const insertText = async (textToInsert: string, richTextEditorSelectionMarker?: string) => {
	const needsEditorSwitch = await needsToSwitchEditorsBeforeInsertingText();

	// MCE or Joplin has a bug where inserting markdown code for an SVG image removes
	// the image data. See https://github.com/laurent22/joplin/issues/7547.
	if (needsEditorSwitch) {
		// Switch to the markdown editor.
		await joplin.commands.execute('toggleEditors');

		// Delay: Ensure we're really in the CodeMirror editor.
		await waitFor(100);

		// Jump to the rich text editor selection
		await joplin.commands.execute('editor.execCommand', {
			name: 'js-draw--cmSelectAndDelete',
			args: [richTextEditorSelectionMarker],
		});
	}

	await joplin.commands.execute('insertText', textToInsert);

	// Try to switch back to the original editor
	if (needsEditorSwitch) {
		await joplin.commands.execute('toggleEditors');
	}
};

joplin.plugins.register({
	onStart: async function () {
		const tmpdir = await TemporaryDirectory.create();
		const drawingDialog = await DrawingDialog.getInstance(tmpdir);

		await registerAndApplySettings(drawingDialog);

		const insertNewDrawing = async (svgData: string, richTextEditorSelectionData?: string) => {
			const resource = await Resource.ofData(
				tmpdir,
				svgData,
				localization.defaultImageTitle,
				'.svg',
			);

			const textToInsert = `![${resource.htmlSafeTitle()}](:/${resource.resourceId})`;
			await insertText(textToInsert, richTextEditorSelectionData);
			return resource;
		};

		const getDialog = async (inNewWindow: boolean) => {
			let dialog: AbstractDrawingView = drawingDialog;
			if (inNewWindow) {
				dialog = new DrawingWindow(tmpdir);
				await applySettingsTo(dialog);
			}

			return dialog;
		};

		const editDrawing = async (
			resourceUrl: string,
			allowSaveAsCopy: boolean = true,
			inNewWindow: boolean,
		): Promise<Resource | null> => {
			const expectedMime = 'image/svg+xml';
			const originalResource = await Resource.fromURL(tmpdir, resourceUrl, '.svg', expectedMime);

			if (!originalResource) {
				throw new Error('Invalid resource URL!');
			}

			if (originalResource.mime !== expectedMime) {
				alert(localization.notAnEditableImage(resourceUrl, originalResource.mime));
				return null;
			}

			let resource = originalResource;
			const saveAsNewCallback = async (data: string) => {
				console.log('Image editor: Inserting new drawing...');
				resource = await insertNewDrawing(data);
			};

			const dialog = await getDialog(inNewWindow);
			const saved = await dialog.promptForDrawing({
				initialData: await resource.getDataAsString(),
				saveCallbacks: {
					overwrite: async (data) => {
						console.log('Image editor: Overwriting resource...');
						await resource.updateData(data);
					},
					saveAsNew: allowSaveAsCopy ? saveAsNewCallback : null,
				},
			});

			return saved ? resource : null;
		};

		const editOrInsertDrawing = async (inNewWindow: boolean) => {
			const selection = await joplin.commands.execute('selectedText');

			// If selecting a resource URL, edit that. Else, insert a new drawing.
			if (selection && (/^:\/[a-zA-Z0-9]+$/.exec(selection) || /^[a-z0-9]{32}$/.exec(selection))) {
				console.log('Attempting to edit selected resource,', selection);

				// TODO: Update the cache-breaker for the resource.
				await editDrawing(selection, false, inNewWindow);
			} else {
				let savedSelection: string | undefined = undefined;
				if (await needsToSwitchEditorsBeforeInsertingText()) {
					savedSelection = await saveRichTextEditorSelection();
				}

				const dialog = await getDialog(inNewWindow);

				let savedResource: Resource | null = null;
				const saved = await dialog.promptForDrawing({
					initialData: undefined,
					saveCallbacks: {
						saveAsNew: async (svgData) => {
							savedResource = await insertNewDrawing(svgData, savedSelection);
						},
						overwrite: async (svgData) => {
							if (!savedResource) {
								throw new Error('A new drawing must be saved once before it can be overwritten');
							}

							await savedResource.updateData(svgData);
						},
					},

					// Save as new without a prompt (can't overwrite at first)
					initialSaveMethod: SaveMethod.SaveAsNew,
				});

				// If the user canceled the drawing,
				if (!saved) {
					// Clear the selection marker, if it exists.
					if (savedSelection) {
						await insertText('', savedSelection);
					}

					return;
				}
			}
		};

		const editInSameWindowCommand = `${pluginPrefix}insertDrawing`;
		await joplin.commands.register({
			name: editInSameWindowCommand,
			label: localization.insertDrawing,
			enabledCondition: 'oneNoteSelected && !noteIsReadOnly',
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				await editOrInsertDrawing(false);
			},
		});

		const editInNewWindowCommand = `${pluginPrefix}insertDrawing__newWindow`;
		await joplin.commands.register({
			name: editInNewWindowCommand,
			label: localization.insertDrawingInNewWindow,
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				await editOrInsertDrawing(true);
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
			'./contentScripts/codeMirror.js',
		);
		await joplin.contentScripts.onMessage(
			markdownItContentScriptId,
			async (resourceUrl: string) => {
				return (await editDrawing(resourceUrl, true, false))?.resourceId;
			},
		);
	},
});
