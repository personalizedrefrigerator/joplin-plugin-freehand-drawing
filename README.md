# `joplin-plugin-freehand-drawing`
[On GitHub](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing) | [On the Joplin Forum](https://discourse.joplinapp.org/t/plugin-js-draw-integration/27114)

A Joplin plugin for creating and editing freehand drawings.

<img width="600" src="./screenshot.png"/>

## Installing
Search for "freehand drawing" under the plugins tab in Joplin's settings:
![screenshot of the search bar and results in the plugins tab. Freehand Drawing // create and edit drawings with js-draw is the only visible result.](https://user-images.githubusercontent.com/46334387/188908688-1500567d-f9a4-49b5-9dc1-8b5a00210c97.png)

After installation, an "insert drawing" button should appear in the toolbar:
![A pen icon labeled "insert drawing" is shown in the markdown toolbar, just to the right of the "insert date" button.](https://user-images.githubusercontent.com/46334387/188909272-603d2556-d5ab-4b8a-86fa-d90b5bafd379.png)

Existing drawings can be edited by hovering over the drawing in the markdown preview pane, then clicking "edit".
![screenshot of a drawing in the preview pane and an edit button, beneath the cursor. The edit button is at the bottom-right of the drawing.](https://user-images.githubusercontent.com/46334387/188909876-1b7c41d5-8fd9-4a15-86d9-a91504ddf5c1.png)

# Notes
 * This plugin uses [js-draw](https://github.com/personalizedrefrigerator/js-draw) to edit/create freehand drawings. Bugs related to `js-draw` can be reported using its [issue tracker](https://github.com/personalizedrefrigerator/js-draw/issues).


# Development
## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `yarn run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.
