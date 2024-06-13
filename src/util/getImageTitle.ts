import { ImageMetadata } from '../types';

const makeImageTitle = (template: string, data: ImageMetadata) => {
	const templateFields = {
		short_text: data.text.substring(0, 16),
		long_text: data.text.substring(0, 128),
		full_text: data.text,
		date_and_time: new Date().toString(),
	};
	return template.replace(/{{([a-z_]+)}}/g, (match, group) => {
		if (Object.prototype.hasOwnProperty.call(templateFields, group)) {
			return templateFields[group as keyof typeof templateFields];
		}
		return match;
	});
};

export default makeImageTitle;
