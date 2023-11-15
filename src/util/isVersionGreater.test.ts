import isVersionGreater from './isVersionGreater';

describe('isVersionGreater', () => {
	test('should return true if first argument is greater than second', () => {
		expect(isVersionGreater('1.2.3', '0.0.0')).toBe(true);
		expect(isVersionGreater('1.2.3', '1.2.0')).toBe(true);
		expect(isVersionGreater('1.2.3', '1.1.9')).toBe(true);
		expect(isVersionGreater('1.2.3', '0.2.3')).toBe(true);
		expect(isVersionGreater('1.2.3', '0.4.3')).toBe(true);
		expect(isVersionGreater('88.2.3', '9.2.4')).toBe(true);
		expect(isVersionGreater('2.13.6', '2.13.5')).toBe(true);
		expect(isVersionGreater('2.14.0', '2.13.5')).toBe(true);
		expect(isVersionGreater('2.14.4', '2.13.5')).toBe(true);
		expect(isVersionGreater('2.14.5', '2.13.5')).toBe(true);
	});
	test('should return false if second argument is greater than the first', () => {
		expect(isVersionGreater('0.0.0', '1.2.3')).toBe(false);
		expect(isVersionGreater('1.2.0', '1.2.3')).toBe(false);
		expect(isVersionGreater('1.1.9', '1.2.3')).toBe(false);
		expect(isVersionGreater('1.2.2', '1.2.3')).toBe(false);
		expect(isVersionGreater('2.13.4', '2.13.5')).toBe(false);
		expect(isVersionGreater('2.12.12', '2.13.5')).toBe(false);
		expect(isVersionGreater('2.13.4', '2.13.5')).toBe(false);
		expect(isVersionGreater('2.13.4', '2.13.7')).toBe(false);
	});
	test('should return false if first and second arguments are the same', () => {
		expect(isVersionGreater('0.0.0', '0.0.0')).toBe(false);
		expect(isVersionGreater('2.0.00', '2.0.0')).toBe(false);
	});
});
