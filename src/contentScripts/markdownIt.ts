import type MarkdownIt = require('markdown-it');
import type Renderer = require('markdown-it/lib/renderer');
import type Token = require('markdown-it/lib/token');
import makeImageEditable from './utils/makeImageEditable';
import localization from '../localization';

export default ({ contentScriptId }: { contentScriptId: string }) => {
	return {
		plugin: (markdownIt: MarkdownIt, _options: any) => {
			// Ref: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
			// and the joplin-drawio plugin
			const originalRenderer = markdownIt.renderer.rules.image;
			markdownIt.renderer.rules.image = (
				tokens: Token[],
				idx: number,
				options: MarkdownIt.Options,
				env: any,
				self: Renderer,
			): string => {
				const defaultHtml = originalRenderer?.(tokens, idx, options, env, self) ?? '';

				const svgUrlExp =
					/src\s*=\s*['"](file:[/][/]|jop[-a-zA-Z]+:[/][/])?[^'"]*[.]svg([?]t=\d+)?['"]/i;
				if (!svgUrlExp.exec(defaultHtml ?? '')) {
					return defaultHtml;
				}

				const processImageFn = markdownIt.utils.escapeHtml(makeImageEditable.toString());

				const escapeAndQuote = (text: string) => {
					return JSON.stringify(markdownIt.utils.escapeHtml(text));
				};

				const htmlWithOnload = defaultHtml.replace(
					'<img ',
					// Required for older versioins of the Rich Text Editor, where scripts must be inlined.
					`<img onload="(${processImageFn})(this.parentElement)" `,
				);

				return [
					'<span',
					`	class='jsdraw--svgWrapper'`,
					`	data-js-draw-edit-label=${escapeAndQuote(localization.edit)}`,
					`	data-js-draw-content-script-id=${escapeAndQuote(contentScriptId)}`,
					`	contentEditable='false'>`,
					htmlWithOnload,
					'</span>',
				].join('');
			};
		},
		assets: () => {
			return [{ name: 'markdownIt.css' }, { name: 'markdownIt-content.js' }];
		},
	};
};
