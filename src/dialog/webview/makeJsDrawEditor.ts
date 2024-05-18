import MaterialIconProvider from '@js-draw/material-icons';
import Editor, { Erase, RenderingMode, adjustEditorThemeForContrast } from 'js-draw';
import { EditorCallbacks } from './types';
import { EditorStyle, KeybindingRecord, ToolbarType } from '../../types';
import loadTemplate from './template/loadTemplate';
import { SettingControl } from './settings/types';
import setupToolbar from './setupToolbar';
import saveStateAsTemplate from './template/saveStateAsTemplate';
import applyShortcutOverrides from './applyShortcutOverrides';

export interface EditorControl {
	editor: Editor;
	applyStyle(style: EditorStyle): void;
	setToolbarMode(mode: ToolbarType): void;
	applyShortcutOverrides(shortcuts: KeybindingRecord): void;
	loadInitialImage(data: string): Promise<void>;
	hasUnsavedChanges(): boolean;
	onSaved(): void;
}

const makeJsDrawEditor = async (
	settingControl: SettingControl,
	callbacks: EditorCallbacks,

	// For testing (allows running with jsdom)
	disableRenderer?: boolean,
) => {
	const editor = new Editor(document.body, {
		iconProvider: new MaterialIconProvider(),

		// Disable the renderer to hide jsdom warnings when testing.
		renderingMode: disableRenderer ? RenderingMode.DummyRenderer : undefined,

		image: {
			showImagePicker: async ({ setOnCancelCallback }): Promise<File[] | null> => {
				const imageTask = await callbacks.showImagePicker();
				setOnCancelCallback(() => {
					imageTask.cancel();
					imageTask.cleanUp();
				});
				const images = await imageTask.images;
				if (!images) return null;

				const files: File[] = [];
				for (const image of images) {
					const data = await fetch(image.path);
					const buffer = await data.arrayBuffer();
					files.push(
						new File([buffer], image.name, {
							type: image.mime,
						}),
					);
				}

				imageTask.cleanUp();

				return files;
			},
		},
	});
	editor.focus();

	await loadTemplate(editor, settingControl);
	// Zoom to the preview region (loadFromSVG, if called, will zoom to the new region)
	const addToHistory = false;
	await editor.dispatchNoAnnounce(
		editor.viewport.zoomTo(editor.getImportExportRect()),
		addToHistory,
	);

	let prevStyle: EditorStyle | null = null;
	const applyStyle = (styleName: EditorStyle) => {
		const editorRoot = editor.getRootElement();
		if (prevStyle) {
			editorRoot.classList.remove(styleName);
		}

		editorRoot.classList.add(styleName);
		prevStyle = styleName;

		adjustEditorThemeForContrast(editor);
	};

	let toolbarControl: ReturnType<typeof setupToolbar>;

	const saveDrawing = async () => {
		saveStateAsTemplate(editor, settingControl);
		callbacks.onSave();
	};

	const exitEditor = () => {
		callbacks.onExit();
	};

	toolbarControl = setupToolbar(
		editor,
		{
			onSavePress: saveDrawing,
			onExitPress: exitEditor,
		},
		settingControl,
	);

	return {
		editor,
		applyStyle,
		setToolbarMode: toolbarControl.setToolbarMode,
		applyShortcutOverrides: (overrides: KeybindingRecord) => {
			applyShortcutOverrides(editor, overrides);
		},
		loadInitialImage: async (svgData: string) => {
			toolbarControl.setLoading(true);

			// Clear the background
			const addToHistory = false;
			await editor.dispatchNoAnnounce(
				new Erase(editor.image.getBackgroundComponents()),
				addToHistory,
			);

			await editor.loadFromSVG(svgData);

			toolbarControl.setLoading(false);
			toolbarControl.setSaved();
		},
		hasUnsavedChanges: () => toolbarControl.hasUnsavedChanges(),
		onSaved: () => toolbarControl.setSaved(),
	};
};

export default makeJsDrawEditor;
