module.exports = {
	// --ignore-path tells prettier to ignore files in .eslintignore
	'**/*.{js,ts,tsx}': ['eslint --fix', 'prettier --ignore-path .eslintignore --write'],
	'**/*.{json,md,css,scss}': ['prettier --ignore-path .eslintignore --write'],
};
