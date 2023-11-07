import Editor, { KeyBinding } from 'js-draw';
import { KeybindingRecord } from '../../types';

const applyShortcutOverrides = (editor: Editor, shortcuts: KeybindingRecord) => {
	for (const id in shortcuts) {
		try {
			console.log('apply shortcut override', id, shortcuts[id]);
			const keybindings = shortcuts[id].map((keybindingString) =>
				KeyBinding.fromString(keybindingString),
			);
			editor.shortcuts.overrideShortcut(id, keybindings);
		} catch (error) {
			console.error('Invalid keybinding for id', id, '. Error: ', error);
		}
	}
};

export default applyShortcutOverrides;
