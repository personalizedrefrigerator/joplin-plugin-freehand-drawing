# 2.10.0 and 2.10.1

- [Updates `js-draw` to v1.20.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1200)
  - Performance improvement when loading large drawings.
  - Possible fix for stylus erasers not erasing on some devices.
  - Support for attaching multiple images at once.
- (Joplin > 3.0.2): Support inserting PDF screenshots using the "insert image" tool.
  - As a result, the "insert image" tool now uses Joplin's plugin API to show a file chooser dialog.
- Bug fixes
  - Fix editors opened in new windows are initially scrolled.

# 2.9.0 and 2.9.1

- [Updates `js-draw` to v1.18.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1180)
  - New pen type.
  - Partial stroke eraser.
- Bug fixes
  - Fixed "Edit" button incorrectly shown in the Rich Text Editor in Joplin 3.0.

# 2.8.0

- [Updates `js-draw` to v1.17.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1170)
  - Better copy/paste interop with other applications.
- Features
  - (Beta) Multi-window support.
    - To edit a resource in a new window, select that resource's ID in the editor, press <kbd>ctrl</kbd>-<kbd>shift</kbd>-<kbd>p</kbd> (<kbd>cmd</kbd>-<kbd>shift</kbd>-<kbd>p</kbd> on Mac) and type `:insertDrawing__newWindow`. It may be necessary to switch notes for the drawing to update in the viewer.
    - For now, avoid having the same drawing open in multiple different windows.
- Bug fixes
  - Fixed plugin temporary directories created by this plugin not removed when closing Joplin.

# 2.7.1

- [Updates `js-draw` to v1.16.1](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1161)
  - Fixes accessibility text could sometimes be selected and dropped into the editor. (https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing/issues/8)

# 2.7.0

- [Updates `js-draw` to v1.16.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1160)
  - Snap zoom to powers of 10 when zooming with touch.
  - Fix strokes flicker while rotating the screen.
  - Prevent the selection rectangle from being incorrectly visible at the top left corner of the screen when starting a new selection.

# 2.6.0

- [Updates `js-draw` to v1.15.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1150)
  - Find (with <kbd>ctrl</kbd>-<kbd>f</kbd>) now searches in image alt text, in addition to text blocks.
  - Added help information to pen/selection/page dropdowns.

# 2.5.0

- [Updates `js-draw` to v1.12.0](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1120)
  - Fixes using shift+drag to lock a selection's motion to either the horizontal or vertical axis.
  - Adjusts how curve fitting works.

# 2.4.1

- Bug fixes
  - Disallow save as copy when the drawing dialog was opened by selecting a resource URL.
    - Previously, the copy of the resource would replace the URL.
  - Fix saves after "save as copy" save to the wrong image.

# 2.4.0

- Bug fixes
  - Fixes pressing <kbd>Ctrl</kbd>+<kbd>R</kbd> (resize to selection) also brings a selection to the top.
- Features
  - Pressing <kbd>End</kbd> when there is a selection now sends the selection to the back.
  - Pressing <kbd>Alt</kbd>+<kbd>q</kbd> is now equivalent to pressing "Exit".
  - Initial support for customizing keyboard shortcuts within the editor.
    - Keyboard shortcuts can be added to Joplin's `settings.json`.
    - This is currently difficult to do, as there is no UI for this.

# 2.3.1

- Bug fixes
  - Fix saving new images multiple times continues creating new images.

# 2.3.0

- UI changes
  - Support for editing existing drawings in the rich text editor. Double-click on a drawing to edit.
  - Clicking "save" gives the user the option to continue editing (if user input is required) or saves without presenting a dialog (if no input is required).
- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1100)
  - See the [`js-draw` changelog](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#1100) for the full list of changes (previous version was 1.3.1).
- Bug fixes
  - Fixes `updated_time` not changed when updating drawings. This may fix sync issues in some Joplin pre-release versions.

# 2.2.1

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#131)
  - Fixes text/images moving when created at roughly ≥ 10⁷× zoom.
  - Fixes grid lines vanishing at high zoom levels.

# 2.2.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#130)
  - Adds support for drawings that automatically resize to fit their content on save.
  - Adds scrollbars (read-only for now)
  - Bug fixes and performance improvements.

# 2.1.2

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#121)
  - Fix low-contrast colors in Joplin ≤ v2.11
  - Fix edge toolbar open/closing animations in Joplin ≤ v2.11

# 2.1.0, 2.1.1

- Fix incorrect `manifest.json` version number.
- Adjust default color theme for higher contrast.

# 2.0.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#102)
  - Adds a new toolbar theme (a theme similar to the original can be enabled in settings)
  - Adds a theme switcher in settings
    - The default `js-draw` themes can now be selected in addition to a "match Joplin" setting
- Centers the background/drawing area when making a new image.

# 1.12.1

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0251)
  - Fixes strokes disappearing when drawn with the mouse when running in the version of Electron used by Joplin.

# 1.12.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0250)
  - Possible fix for strokes canceling on pen up on some devices.
  - Fix strokes sometimes not resizing properly on zoom.
  - Fix `r` and `R` keys causing rotation in the same direction (they should cause rotation in opposite directions).
  - Switch to a different pen type submenu.

# 1.11.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0240)
  - Adds support for rendering relatively positioned text from SVGs
  - Adds a circle pen type.
- Bug fixes
  - Previously, when saving a **new** image, the plugin would ask the user whether they want to save or overwrite. The "overwrite" option has been removed in this case.

# 1.10.0 and 1.10.1

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0230)
  - Add animations when opening/closing dropdowns.
  - Snap selection translation/drawing to x/y axes when holding shift.

# 1.9.0

- Updates German localization (thanks to @Mr-Kanister)
- By default, display the editor in fullscreen.
  - A setting has been added that allows disabling this.

# 1.8.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0122)
  - Improved German localization (thanks to @Mr-Kanister)
  - Don't draw when the user **clicks** on the canvas to close the color picker. Drawing is still done if the user clicks and drags.

# 1.7.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0121)
  - Bug fix: Closing color picker: Start drawing immediately, rather than require an extra tap.
  - Use edge of strokes, rather than center, for erasing/selection. This was previously only the case for flat-tiped strokes.
  - Adjustments to stroke smoothing.

# 1.6.1

- Bug fix: Don't apply template backgrounds when loading images that have no background.

# 1.6.0

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0120)
  - Grid-style backgrounds
- Uses the last-saved image's background and size as a template for new images.

# 1.5.2

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0190)
  - Fixes touchpad pinch zoom offset vertically from cursor

# 1.5.1

- Don't move the save button to the overflow menu.
- Add space between save/close buttons and the other buttons.
- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0174)

# 1.5.0

- Map `ctrl+s` to save in js-draw editor
- Show "Insert Image" in edit menu and, thus, the "Keyboard Shortcuts" section of settings.

# 1.4.7

- Bug fixes
  - Fixes "insert image" button broken in non-beta versions of Joplin when the rich text editor was visible.

# 1.4.6

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0172)
  - Fixes canvas not resizing on window resize.
  - Fixes changing the color of duplicated text objects.
- Bug fixes
  - Fixes "insert image" button not working in the rich text editor.

# 1.4.5

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0160)
  - Ability to change the background color.
  - Overflow menu for the toolbar.

# 1.4.4

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0152)
  - Don't select/erase objects that have `isSelectable` set to `false`.
  - Fix larger-than-necessary output size of arrow/rectangle/line shapes.
  - Fix view jumping while zooming in/rotating with touchscreen pan tool.

# 1.4.3

- [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0150)
  - `ctrl+A`-related bug fixes.
  - Adds a "reformat selection" button (allows changing selection color).

# 1.4.2

- Updates `js-draw`
  - Activate shortcuts with `cmd` in addition to `ctrl`. E.g. on MacOS, cmd+a should select everything when the selection tool is enabled.
  - Allow mirroring the seleciton.

# 1.4.1

- Updates `js-draw`
  - Rotation snapping while rotating the screen with touch

# 1.4.0

- Updates `js-draw`
  - New pen icons
  - Snap to grid while holding control key.

# 1.3.10

- Updates `js-draw`
  - Resizable eraser
  - Selection- & text tool-related bug fixes

# 1.3.9

- Updates `js-draw`
  - Performance improvements

# 1.3.8

- Updates `js-draw`
  - Works around another inertial scrolling issue triggered when a stylus gets close to the screen during a touch panning gesture.
  - Adds an "insert image" dialog.

# 1.3.7

- Updates `js-draw`
  - Fixes inertial scrolling issue.

# 1.3.6

- Updates `js-draw`
  - Performance improvements
  - Different icons for rounded/non-rounded pens

# 1.3.5

- Updates `js-draw`
  - Misc. bug fixes
  - Inertial touchscreen scrolling.

# 1.3.4

- Focus the editor when fisrt opened.
  - It is no longer necessary to click on the editor to use keyboard shortcuts.

# 1.3.3

- Updates `js-draw`

* Ability to change the default font size.

# 1.3.2

- Updates js-draw:
  - Save images with `fill=none` for strokes with no fill.
  - Adds a find dialog that can be opened with `ctrl+f`.

# 1.3.1

- Save and load tool state (e.g. pen sizes and colors) when closing/opening the editor.
- Allow locking touchscreen screen rotation.
- Bug fixes.

# 1.3.0

- Non-pressure-sensitive strokes by default

# 1.2.2

- Updates `js-draw`
  - Fixes exporting multi-line text regions to SVG.

# 1.2.1

- Updates `js-draw`
  - Fixes unnecessary scrollbars when editing/adding text.

# 1.2.0

- Updates `js-draw`
- Edit existing text fields by clicking on them while using the text tool.
- Increases auto-save frequency to 0.5 Hz.

# 1.1.2

- Updates `js-draw`
  - Hand tool can now be toggled with one click.
  - Keyboard shortcuts:
    - `ctrl+d` for duplicate selection
    - `ctrl+r` for resize image to selection
    - `shift+click` to expand the selection

# 1.1.1

- Publishes changes from 1.1.0 (`manifest.json` needed to be updated)
- Updates `js-draw`
  - `Ctrl+1` through `Ctrl+9` select pen drawing modes (if a pen is selected). `1-9` still selects tools.

# 1.1.0

- Bug fixes
  - Fixes: Unable to close `js-draw` editor window if the editor fails to load.
  - Fixes: Unable to edit images when the `Joplin Enhancement` plugin is enabled.

# 1.0.21

- Updates `js-draw`
  - Bug fixes
    - Division by zero error when drawing strokes.

# 1.0.20

- Updates `js-draw`
  - Selection-related bug fixes.
  - Fixes an issue where some strokes would distort when saving.

# 1.0.19

- Updates `js-draw`
  - `Ctrl+C`, `Ctrl+V`, and opening images dropped into the editor.
  - Delete the selection by pressing `Backspace` or `Delete`.

# 1.0.18

- Updates `js-draw`
  - Faster autosaves.
  - Switch tools with `ctrl+1`, `ctrl+2`, ...

# 1.0.17

- Increases the autosave interval to once per minute.
- Updates `js-draw`
  - Higher quality while moving the view with a touchscreen.

# 1.0.16

- Updates `js-draw`
  - Fixes strokes with thickness set to a very small number self-intersecting many times.

# 1.0.15

- German localization

# 1.0.14

- Spanish localization
  - I haven't found a way to determine Joplin's locale through the plugin API. As such, this is based on the system's locale, **not** Joplin's locale.
- Updates `js-draw`
  - Bug fixes

# 1.0.13

- Updates `js-draw`
  - Accessibility fixes
  - Other bug fixes.

# 1.0.12

- Updates `js-draw`
  - Adds a reset zoom/viewport button.

# 1.0.11

- Updates `js-draw`
  - Make icon foregrounds match Joplin's theme when buttons are selected.
- Autosaves every two minutes. At present there is only one autosave file.
  - Press `Ctrl+Shift+P`, then type `Restore from autosave` to restore from the autosaved drawing.

# 1.0.10

- Updates `js-draw`
  - Fixes a regression -- opening the color picker and attempting to change the color would cause the picker to immediately disappear.

# 1.0.9

- Match Joplin's theme.

# 1.0.8

- Updates `js-draw`
  - Adds a pipette tool (pick colors by clicking on the screen)
  - Adds recent colors to the list of suggested colors
- Fixes "resume editing" button sometimes not working.

# 1.0.7

- Updates `js-draw`
  - Fixes loading text from SVGs in Chrome, and thus in Joplin.

# 1.0.6

- Updates `js-draw`
  - Adds a text tool
  - Various bug fixes and improvements

# 1.0.5

- Updates `js-draw` to the latest version
  - Caches rendered strokes (where possible) for performance
  - Bug fixes
- Fixes a bug where an old version of an edited image was sometimes drawn in the preview pane instead of the updated image.

# 1.0.1

- Allows discarding changes: Adds a "close" button to the `js-draw` toolbar.
