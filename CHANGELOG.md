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
