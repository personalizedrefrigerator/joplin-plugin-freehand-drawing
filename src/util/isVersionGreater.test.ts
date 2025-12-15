import isVersionGreater from './isVersionGreater.ts';
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';

describe('isVersionGreater', () => {
	for (const [versionA, versionB, expected] of [
		['1.2.3', '0.0.0', true],
		['1.2.3', '1.2.0', true],
		['1.2.3', '0.2.3', true],
		['1.2.3', '0.4.3', true],
		['88.2.3', '9.2.4', true],
		['2.13.6', '2.13.5', true],
		['2.14.0', '2.13.5', true],

		['0.0.0', '0.0.1', false],
		['0.0.1', '0.1.0', false],
		['1.1.1', '10.0.0', false],

		['0.0.0', '0.0.0', false],
		['2.0.00', '2.0.0', false],
	] as [string, string, boolean][]) {
		test(`${versionA} should ${expected ? '' : 'not '}be greater than ${versionB}`, () => {
			assert.equal(isVersionGreater(versionA, versionB), expected);
		});
	}
});
