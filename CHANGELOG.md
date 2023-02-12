# 1.4.5
 * [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0160)
   - Ability to change the background color.
   - Overflow menu for the toolbar.

# 1.4.4
 * [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0152)
   - Don't select/erase objects that have `isSelectable` set to `false`.
   - Fix larger-than-necessary output size of arrow/rectangle/line shapes.
   - Fix view jumping while zooming in/rotating with touchscreen pan tool.

# 1.4.3
 * [Updates `js-draw`](https://github.com/personalizedrefrigerator/js-draw/blob/main/CHANGELOG.md#0150)
   - `ctrl+A`-related bug fixes.
   - Adds a "reformat selection" button (allows changing selection color).

# 1.4.2
 * Updates `js-draw`
   - Activate shortcuts with `cmd` in addition to `ctrl`. E.g. on MacOS, cmd+a should select everything when the selection tool is enabled.
   - Allow mirroring the seleciton.

# 1.4.1
 * Updates `js-draw`
   - Rotation snapping while rotating the screen with touch

# 1.4.0
 * Updates `js-draw`
   - New pen icons
   - Snap to grid while holding control key.

# 1.3.10
 * Updates `js-draw`
   - Resizable eraser
   - Selection- & text tool-related bug fixes

# 1.3.9
 * Updates `js-draw`
   - Performance improvements

# 1.3.8
 * Updates `js-draw`
   - Works around another inertial scrolling issue triggered when a stylus gets close to the screen during a touch panning gesture.
   - Adds an "insert image" dialog.

# 1.3.7
 * Updates `js-draw`
   - Fixes inertial scrolling issue.

# 1.3.6
 * Updates `js-draw`
   - Performance improvements
   - Different icons for rounded/non-rounded pens

# 1.3.5
 * Updates `js-draw`
   - Misc. bug fixes
   - Inertial touchscreen scrolling.

# 1.3.4
 * Focus the editor when fisrt opened.
   * It is no longer necessary to click on the editor to use keyboard shortcuts.

# 1.3.3
 * Updates `js-draw`
  - Ability to change the default font size.

# 1.3.2
 * Updates js-draw:
   * Save images with `fill=none` for strokes with no fill.
   * Adds a find dialog that can be opened with `ctrl+f`.

# 1.3.1
 * Save and load tool state (e.g. pen sizes and colors) when closing/opening the editor.
 * Allow locking touchscreen screen rotation.
 * Bug fixes.

# 1.3.0
 * Non-pressure-sensitive strokes by default

# 1.2.2
 * Updates `js-draw`
   * Fixes exporting multi-line text regions to SVG.

# 1.2.1
 * Updates `js-draw`
   * Fixes unnecessary scrollbars when editing/adding text.

# 1.2.0
 * Updates `js-draw`
  * Edit existing text fields by clicking on them while using the text tool.
 * Increases auto-save frequency to 0.5 Hz.

# 1.1.2
 * Updates `js-draw`
   * Hand tool can now be toggled with one click.
   * Keyboard shortcuts:
     * `ctrl+d` for duplicate selection
     * `ctrl+r` for resize image to selection
     * `shift+click` to expand the selection

# 1.1.1
 * Publishes changes from 1.1.0 (`manifest.json` needed to be updated)
 * Updates `js-draw`
   * `Ctrl+1` through `Ctrl+9` select pen drawing modes (if a pen is selected). `1-9` still selects tools.

# 1.1.0
 * Bug fixes
   * Fixes: Unable to close `js-draw` editor window if the editor fails to load.
   * Fixes: Unable to edit images when the `Joplin Enhancement` plugin is enabled.

# 1.0.21
 * Updates `js-draw`
   * Bug fixes
     * Division by zero error when drawing strokes.

# 1.0.20
 * Updates `js-draw`
   * Selection-related bug fixes.
   * Fixes an issue where some strokes would distort when saving.

# 1.0.19
 * Updates `js-draw`
   * `Ctrl+C`, `Ctrl+V`, and opening images dropped into the editor.
   * Delete the selection by pressing `Backspace` or `Delete`.

# 1.0.18
 * Updates `js-draw`
   * Faster autosaves.
   * Switch tools with `ctrl+1`, `ctrl+2`, ...

# 1.0.17
 * Increases the autosave interval to once per minute.
 * Updates `js-draw`
   * Higher quality while moving the view with a touchscreen.

# 1.0.16
 * Updates `js-draw`
   * Fixes strokes with thickness set to a very small number self-intersecting many times.

# 1.0.15
 * German localization

# 1.0.14
 * Spanish localization
   * I haven't found a way to determine Joplin's locale through the plugin API. As such, this is based on the system's locale, **not** Joplin's locale.
 * Updates `js-draw`
   * Bug fixes

# 1.0.13
 * Updates `js-draw`
   * Accessibility fixes
   * Other bug fixes.

# 1.0.12
 * Updates `js-draw`
   * Adds a reset zoom/viewport button.

# 1.0.11
 * Updates `js-draw`
   * Make icon foregrounds match Joplin's theme when buttons are selected.
 * Autosaves every two minutes. At present there is only one autosave file.
   * Press `Ctrl+Shift+P`, then type `Restore from autosave` to restore from the autosaved drawing.

# 1.0.10
 * Updates `js-draw`
   * Fixes a regression -- opening the color picker and attempting to change the color would cause the picker to immediately disappear.

# 1.0.9
 * Match Joplin's theme.

# 1.0.8
 * Updates `js-draw`
   * Adds a pipette tool (pick colors by clicking on the screen)
   * Adds recent colors to the list of suggested colors
 * Fixes "resume editing" button sometimes not working.

# 1.0.7
 * Updates `js-draw`
   * Fixes loading text from SVGs in Chrome, and thus in Joplin.

# 1.0.6
 * Updates `js-draw`
   * Adds a text tool
   * Various bug fixes and improvements

# 1.0.5
 * Updates `js-draw` to the latest version
   * Caches rendered strokes (where possible) for performance
   * Bug fixes
 * Fixes a bug where an old version of an edited image was sometimes drawn in the preview pane instead of the updated image.

# 1.0.1
 * Allows discarding changes: Adds a "close" button to the `js-draw` toolbar.
