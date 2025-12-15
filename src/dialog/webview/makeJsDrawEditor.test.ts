import '../../testing/domSetup.ts';
import { Color4, InputEvtType, Path, Rect2, StrokeComponent, pathToRenderable } from 'js-draw';
import makeJsDrawEditor from './makeJsDrawEditor.ts';
import makeTestSVG from './testing/makeTestSVG.ts';
import dummySettingControl from './testing/dummySettingControl.ts';
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('makeJsDrawEditor', () => {
	it('should disable save button while loading and when saved', async () => {
		let saveCalled = false;
		const editorControl = await makeJsDrawEditor(
			dummySettingControl,
			{
				onSave: () => {
					saveCalled = true;
				},
				onExit: () => {},
				showImagePicker: async () => {
					throw new Error('Unsupported.');
				},
			},
			true,
		);
		const editor = editorControl.editor;

		const editorRoot = editor.getRootElement();

		// Find the save button
		const saveButtonContainer = editorRoot.querySelector('.toolwidget-tag--save')!;
		const saveButton = saveButtonContainer.querySelector('.toolbar-button')!;
		assert.equal(saveButton.matches('.disabled'), false);

		const loadPromise = editorControl.loadInitialImage(makeTestSVG(500));

		assert.equal(saveButton.matches('.disabled'), true);

		await loadPromise;

		// Should still be disabled after loading (until we make a change)
		assert.equal(saveButton.matches('.disabled'), true);

		// Make a change
		const elem = new StrokeComponent([
			pathToRenderable(Path.fromRect(Rect2.unitSquare), { fill: Color4.red }),
		]);
		await editor.dispatch(editor.image.addElement(elem));

		// Should not be disabled after changing something
		assert.equal(saveButton.matches('.disabled'), false);

		// After clicking save (or using the keyboard shortcut in this case),
		// should be up-to-date.
		saveCalled = false;
		editor.sendKeyboardEvent(InputEvtType.KeyPressEvent, 's', true);

		// In the application, the editorControl will be notified after a successful save.
		assert.equal(saveCalled, true);
		editorControl.onSaved();

		// Should be saved
		assert.equal(saveButton.matches('.disabled'), true);
	});
});
