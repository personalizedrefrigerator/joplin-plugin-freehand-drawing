import JoplinData from './JoplinData.ts';
import JoplinPlugins from './JoplinPlugins.ts';
import JoplinWorkspace from './JoplinWorkspace.ts';
import JoplinFilters from './JoplinFilters.ts';
import JoplinCommands from './JoplinCommands.ts';
import JoplinViews from './JoplinViews.ts';
import JoplinInterop from './JoplinInterop.ts';
import JoplinSettings from './JoplinSettings.ts';
import JoplinContentScripts from './JoplinContentScripts.ts';
import JoplinClipboard from './JoplinClipboard.ts';
import JoplinWindow from './JoplinWindow.ts';
import JoplinImaging from './JoplinImaging.ts';
/**
 * This is the main entry point to the Joplin API. You can access various services using the provided accessors.
 *
 * The API is now relatively stable and in general maintaining backward compatibility is a top priority, so you shouldn't except much breakages.
 *
 * If a breaking change ever becomes needed, best effort will be done to:
 *
 * - Deprecate features instead of removing them, so as to give you time to fix the issue;
 * - Document breaking changes in the changelog;
 *
 * So if you are developing a plugin, please keep an eye on the changelog as everything will be in there with information about how to update your code.
 */
export default class Joplin {
    private data_;
    private plugins_;
    private imaging_;
    private workspace_;
    private filters_;
    private commands_;
    private views_;
    private interop_;
    private settings_;
    private contentScripts_;
    private clipboard_;
    private window_;
    private implementation_;
    constructor(implementation: unknown, plugin: unknown, store: any);
    get data(): JoplinData;
    get clipboard(): JoplinClipboard;
    get imaging(): JoplinImaging;
    get window(): JoplinWindow;
    get plugins(): JoplinPlugins;
    get workspace(): JoplinWorkspace;
    get contentScripts(): JoplinContentScripts;
    /**
     * @ignore
     *
     * Not sure if it's the best way to hook into the app
     * so for now disable filters.
     */
    get filters(): JoplinFilters;
    get commands(): JoplinCommands;
    get views(): JoplinViews;
    get interop(): JoplinInterop;
    get settings(): JoplinSettings;
    /**
     * It is not possible to bundle native packages with a plugin, because they
     * need to work cross-platforms. Instead access to certain useful native
     * packages is provided using this function.
     *
     * Currently these packages are available:
     *
     * - [sqlite3](https://www.npmjs.com/package/sqlite3)
     * - [fs-extra](https://www.npmjs.com/package/fs-extra)
     *
     * [View the demo plugin](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/nativeModule)
     */
    require(_path: string): any;
    versionInfo(): Promise<import('./types.ts').VersionInfo>;
}