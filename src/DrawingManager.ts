import joplin from 'api';
import AbstractDrawingView from './dialog/AbstractDrawingView';
import localization from './localization';
import Resource from './Resource';
import TemporaryDirectory from './TemporaryDirectory';
import { SaveMethod } from './types';

type DrawingViewFactory = () => AbstractDrawingView;
type OnUpdateViewSettings = (view: AbstractDrawingView) => void;

interface EditDrawingOptions {
	allowSaveAsCopy?: boolean;
}

const insertText = async (textToInsert: string) => {
	await joplin.commands.execute('insertText', textToInsert);
};

export default class DrawingManager {
	private allDialogs_: AbstractDrawingView[] = [];

	public constructor(
		private temporaryDirectory_: TemporaryDirectory,
		private dialogFactory_: DrawingViewFactory,
		private updateDialogSettings_: OnUpdateViewSettings,
	) {}

	private getClosedDialog_() {
		for (const view of this.allDialogs_) {
			if (!view.isOpen()) {
				return view;
			}
		}
		const newView = this.dialogFactory_();
		this.allDialogs_.push(newView);
		return newView;
	}

	public async insertNewDrawing(svgData: string) {
		const resource = await Resource.ofData(
			this.temporaryDirectory_,
			svgData,
			localization.defaultImageTitle,
			'.svg',
		);

		const textToInsert = `![${resource.htmlSafeTitle()}](:/${resource.resourceId})`;
		await insertText(textToInsert);
		return resource;
	}

	public async editDrawing(resourceUrl: string, { allowSaveAsCopy = true }: EditDrawingOptions) {
		const expectedMime = 'image/svg+xml';
		const originalResource = await Resource.fromURL(
			this.temporaryDirectory_,
			resourceUrl,
			'.svg',
			expectedMime,
		);

		if (!originalResource) {
			throw new Error('Invalid resource URL!');
		}

		if (originalResource.mime !== expectedMime) {
			void joplin.views.dialogs.showMessageBox(
				localization.notAnEditableImage(resourceUrl, originalResource.mime),
			);
			return null;
		}

		let resource = originalResource;
		const saveAsNewCallback = async (data: string) => {
			console.log('Image editor: Inserting new drawing...');
			resource = await this.insertNewDrawing(data);
		};

		const dialog = this.getClosedDialog_();
		this.updateDialogSettings_(dialog);
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
	}

	public async editOrInsertDrawing() {
		const selection = await joplin.commands.execute('selectedText');

		// If selecting a resource URL, edit that. Else, insert a new drawing.
		if (selection && (/^:\/[a-zA-Z0-9]+$/.exec(selection) || /^[a-z0-9]{32}$/.exec(selection))) {
			console.log('Attempting to edit selected resource,', selection);
			await this.editDrawing(selection, { allowSaveAsCopy: false });
		} else {
			const dialog = this.getClosedDialog_();
			this.updateDialogSettings_(dialog);

			let savedResource: Resource | null = null;
			await dialog.promptForDrawing({
				initialData: undefined,
				saveCallbacks: {
					saveAsNew: async (svgData) => {
						savedResource = await this.insertNewDrawing(svgData);
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
		}
	}
}
