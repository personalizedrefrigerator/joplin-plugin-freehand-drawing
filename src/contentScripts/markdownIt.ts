import type MarkdownIt = require('markdown-it');

export default () => {
	return {
		plugin: (_markdownIt: MarkdownIt, _options: any) => {},
		assets: () => {
			return [{ name: 'markdownIt.css' }, { name: 'markdownIt-content.js' }];
		},
	};
};
