export const escapeHtml = (html: string): string => {
	// Reference: https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
	return html
		.replace(/[&]/g, '&amp;')
		.replace(/[<]/g, '&lt;')
		.replace(/[>]/g, '&gt;')
		.replace(/["]/g, '&quot;')
		.replace(/[']/g, '&#39;');
};
