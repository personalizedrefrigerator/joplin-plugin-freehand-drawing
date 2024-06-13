import makeImageTitle from './getImageTitle';

describe('getImageTitle', () => {
	test('should substitute for {{short_text}}', () => {
		expect(makeImageTitle('{{short_text}}', { text: 'Test' })).toBe('Test');
		expect(makeImageTitle('{{short_text}}{{short_text}}', { text: 'TestTest' })).toBe(
			'TestTestTestTest',
		);
		expect(makeImageTitle('Text: {{short_text}}, {{short_text}}', { text: 'Test' })).toBe(
			'Text: Test, Test',
		);
	});
});
