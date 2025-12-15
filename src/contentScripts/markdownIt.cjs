
exports.default = () => {
	return {
		plugin: (_markdownIt, _options) => {},
		assets: () => {
			return [{ name: 'markdownIt.css' }, { name: 'markdownIt-content.js' }];
		},
	};
};
