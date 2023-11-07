import { Color4, InputEvtType, Path, Rect2, StrokeComponent, pathToRenderable } from 'js-draw';
import makeJsDrawEditor from './makeJsDrawEditor';
import makeTestSVG from './testing/makeTestSVG';
import dummySettingControl from './testing/dummySettingControl';

describe('makeJsDrawEditor', () => {
	it('should disable save button while loading and when saved', async () => {
		const saveCallback = jest.fn();
		const exitCallback = jest.fn();

		const editorControl = await makeJsDrawEditor(
			dummySettingControl,
			{
				onSave: saveCallback,
				onExit: exitCallback,
			},
			true,
		);
		const editor = editorControl.editor;

		const editorRoot = editor.getRootElement();

		// Find the save button
		const saveButtonContainer = editorRoot.querySelector('.toolwidget-tag--save')!;
		const saveButton = saveButtonContainer.querySelector('.toolbar-button')!;
		expect(saveButton.matches('.disabled')).toBe(false);

		const loadPromise = editorControl.loadInitialImage(makeTestSVG(500));

		expect(saveButton.matches('.disabled')).toBe(true);

		await loadPromise;

		// Should still be disabled after loading (until we make a change)
		expect(saveButton.matches('.disabled')).toBe(true);

		// Make a change
		const elem = new StrokeComponent([
			pathToRenderable(Path.fromRect(Rect2.unitSquare), { fill: Color4.red }),
		]);
		await editor.dispatch(editor.image.addElement(elem));

		// Should not be disabled after changing something
		expect(saveButton.matches('.disabled')).toBe(false);

		// After clicking save (or using the keyboard shortcut in this case),
		// should be up-to-date.
		saveCallback.mockReset();
		editor.sendKeyboardEvent(InputEvtType.KeyPressEvent, 's', true);

		// In the application, the editorControl will be notified after a successful save.
		expect(saveCallback).toHaveBeenCalled();
		editorControl.onSaved();

		// Should be saved
		expect(saveButton.matches('.disabled')).toBe(true);
	});
});
