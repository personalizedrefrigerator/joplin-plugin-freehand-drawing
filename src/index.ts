import joplin from 'api';
import { ContentScriptType, DialogResult, ToolbarButtonLocation } from 'api/types';
import Resource from './Resource';
import TemporaryDirectory from './TemporaryDirectory';
import { WebViewMessage } from './types';

const strings = {
	insertDrawing: 'Insert Drawing',
};

// While learning how to use the Joplin plugin API,
// * https://github.com/herdsothom/joplin-insert-date/blob/main/src/index.ts
// * and https://github.com/marc0l92/joplin-plugin-drawio
// were both wonderful references.

const dialogs = joplin.views.dialogs;

// [dialog]: A handle to the dialog
const initDrawingDialog = async (dialog: string) => {
	await dialogs.setHtml(dialog, `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset='utf-8'/>
				<meta name='viewport' content='initial-scale=1.0,user-scalable=no,width=device-width'/>
				<title>Draw</title>
			</head>
			<body>
			</body>
		</html>
	`);
	await dialogs.addScript(dialog, './dialog/webview.js');
	await dialogs.addScript(dialog, './dialog/webview.css');
	await dialogs.setFitToContent(dialog, false);
	await dialogs.setButtons(dialog, []);
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
				return initialData;
			} else if (message.type === 'showCloseUnsavedBtn') {
				void dialogs.setButtons(dialogHandle, [{
					id: 'cancel',
					title: 'Discard changes',
				}]);
			} else if (message.type === 'hideCloseUnsavedBtn') {
				void dialogs.setButtons(dialogHandle, []);
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

const pluginPrefix = 'jop-freehand-drawing-jsdraw-plugin-';

joplin.plugins.register({
	onStart: async function() {
		const drawingDialog = await dialogs.create(`${pluginPrefix}jsDrawDialog`);
		const tmpdir = await TemporaryDirectory.create();

		const insertNewDrawing = async (svgData: string) => {
			const resource = await Resource.ofData(tmpdir, svgData, 'Freehand Drawing', '.svg');
			await joplin.commands.execute('insertText', `![${resource.htmlSafeTitle()}](:/${resource.resourceId})`);
		}

		const toolbuttonCommand = `${pluginPrefix}insertDrawing`;
		await joplin.commands.register({
			name: toolbuttonCommand,
			label: strings.insertDrawing,
			iconName: 'fas fa-pen-alt',
			execute: async () => {
				const [ svgData, _saveOption ] = await promptForDrawing(drawingDialog);
				await insertNewDrawing(svgData);
			},
		});

		await joplin.views.toolbarButtons.create(
			toolbuttonCommand, toolbuttonCommand, ToolbarButtonLocation.EditorToolbar
		);

		const editDrawing = async (resourceUrl: string) => {
			const resource = await Resource.fromURL(tmpdir, resourceUrl, '.svg', 'image/svg+xml');
			const [ updatedData, saveOption ] = await promptForDrawing(drawingDialog, await resource.getDataAsString());

			if (saveOption === 'overwrite') {
				console.log('Overwriting with', updatedData);
				await resource.updateData(updatedData);
			} else {
				await insertNewDrawing(updatedData);
			}

			return resource;
		};

		const markdownItContentScriptId = 'jsdraw__markdownIt_editDrawingButton';
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			markdownItContentScriptId,
			'./contentScripts/markdownIt.js',
		);
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (resourceUrl: string) => {
			return (await editDrawing(resourceUrl)).resourceId;
		});
	},
});
