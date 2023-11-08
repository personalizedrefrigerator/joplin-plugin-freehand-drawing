# `joplin-plugin-freehand-drawing`

[On GitHub](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing) | [On the Joplin Forum](https://discourse.joplinapp.org/t/plugin-js-draw-integration/27114) | [Online Demo](https://personalizedrefrigerator.github.io/js-draw/example/index.html) | [Installing](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing#installing)

A Joplin plugin for creating and editing freehand drawings using [js-draw](https://github.com/personalizedrefrigerator/js-draw).

<img width="600" src="./screenshots/editor-lightdark-fullscreen.png"/>

## Installing

Search for "freehand drawing" under the plugins tab in Joplin's settings:
![screenshot of the search bar and results in the plugins tab. Freehand Drawing // create and edit drawings with js-draw is the only visible result.](https://user-images.githubusercontent.com/46334387/188908688-1500567d-f9a4-49b5-9dc1-8b5a00210c97.png)

After installation, an "insert drawing" button should appear in the toolbar:
![A pen icon labeled "insert drawing" is shown in the markdown toolbar, just to the right of the "insert date" button.](https://user-images.githubusercontent.com/46334387/188909272-603d2556-d5ab-4b8a-86fa-d90b5bafd379.png)

Existing drawings can be edited by hovering over the drawing in the markdown preview pane, then clicking "edit".
![screenshot of a drawing in the preview pane and an edit button, beneath the cursor. The edit button is at the bottom-right of the drawing.](https://user-images.githubusercontent.com/46334387/188909876-1b7c41d5-8fd9-4a15-86d9-a91504ddf5c1.png)

# FAQ

## How do I edit drawings from the rich text editor?

**Editing an existing drawing**: Double-click on the drawing.

**Adding a new drawing**: Click either the ![pen](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/assets/46334387/f3a60f00-f1e3-4a8c-9ab7-b0e7c7fea336) toolbar button or "Insert Drawing" from the `Edit` menu.

> **Warning**
>
> To insert drawings in the rich text editor, this plugin works around [this Joplin bug](https://github.com/laurent22/joplin/issues/7547) by **briefly switching to the markdown editor** and back to the rich text editor. This clears the rich text editor's undo history. This should only **apply to new drawings.**

## I only use the markdown editor (no viewer). How do I edit drawings?

First, select the full resource URL for an image created with this plugin

![screenshot: Resource URL (includes :/) is selected](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/assets/46334387/2c71ccc0-d055-45f7-9db7-e0f33f353b81)

Next, click the "Insert Image" button in the toolbar.

## How do I assign a keyboard shortcut to the "Insert Image" button?

1. Open Joplin's settings
2. Click on "Keyboard Shortcuts"
3. Search for "Insert Drawing"
4. Click "_Disabled_"
   ![screenshot: Arrow pointing to "disabled" in the second column of the keyboard shortcuts table](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/assets/46334387/44be3c8a-ac9a-4427-a91d-bcb5a21d7281)
5. Entering a new key combination (e.g. <kbd>Ctrl</kbd>-<kbd>Shift</kbd>-<kbd>D</kbd>).

## How do I disable drawing with touch?

Pen/mouse-only drawing can be enabled under the "Pan" tool's menu by **enabling "Touchscreen panning"**:

![screenshot: Arrow points to pan tool, another arrow points to the "Touchscreen panning" toggle button](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/assets/46334387/682a40ab-0c0f-4dc8-ba49-463dcb06256a)

## Joplin closed while editing a drawing. How do I recover the unsaved changes?

`joplin-plugin-freehand-drawing` autosaves every two minutes. The last autosave can be recovered by

1. Switching to the markdown editor
2. pressing <kbd>Ctrl</kbd>-<kbd>Shift</kbd>-<kbd>P</kbd> (<kbd>Cmd</kbd>-<kbd>Shift</kbd>-<kbd>P</kbd>),
3. typing `:restore autosave`, then
4. clicking "Restore from autosaved drawing"

![screenshot: Command palette shows :restore autosave as search query, second result "Restore from autosaved drawing" is highlighted.](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/assets/46334387/dadaed12-95b5-4c3f-a5cc-f322ad41476d)

This should add a copy of the autosaved drawing to the current note.

## How do I customize the image editor's keyboard shortcuts?

The procedure to do this is currently very complicated, as there is no GUI for this. (Making this simpler is planned!).

<details><summary>Customizing keyboard shortcuts</summary>

First, open Joplin's profile directory ("Help" > "Open profile directory").

Next, open `settings.json` in a text editor.

Near the end, there should be a line similar to this:

```json
    "plugin-io.github.personalizedrefrigerator.js-draw.keyboard-shortcuts": { }
```

Shortcuts can be added between the `{` and the `}`. For example,

```json
	"plugin-io.github.personalizedrefrigerator.js-draw.keyboard-shortcuts": {
		"jsdraw.toolbar.ExitActionWidget.exit": [
			"ctrlOrMeta-w",
			"alt-q"
		],
		"jsdraw.toolbar.SaveActionWidget.save": [
			"ctrlOrMeta-s",
			"ctrlOrMeta-shift-s"
		],
		"jsdraw.toolbar.PenTool.select-pen-1": [
			"CtrlOrMeta-1",
			"alt-1"
		],
		"jsdraw.toolbar.SelectionTool.resizeImageToSelection": [
			"ctrlOrMeta-r",
			"m"
		]
	}
```

The above adds additional shortcuts for exiting, selecting pen style 1, and resizing the visible region to the selection.

Joplin must be restarted for the changes to be applied.

> **Note**
>
> Additional keyboard shortcut IDs can be found [in js-draw's source code](https://github.com/personalizedrefrigerator/js-draw/blob/main/packages/js-draw/src/tools/keybindings.ts).

</details>

## How do I report a bug related to the image editor?

This plugin uses [js-draw](https://github.com/personalizedrefrigerator/js-draw) to edit/create freehand drawings. Bugs related to `js-draw` can be reported using its [issue tracker](https://github.com/personalizedrefrigerator/js-draw/issues).

If you're unsure whether a bug is related to `js-draw` or this plugin, consider first [reporting the bug on this plugin's GitHub repository](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/issues/new/choose). If it's more relevant to `js-draw` than this plugin, it will be moved by a maintainer.
