/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',

	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		// Prevents scripts from running within iframes. js-draw logs warnings
		// if scripts are able to run in iframes that disallow scripts
		runScripts: 'outside-only',
	},
	setupFilesAfterEnv: ['<rootDir>/jestSetup.ts'],
};
