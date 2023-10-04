// Creates a test SVG string with [pathCount] paths.
const makeTestSVG = (pathCount: number) => {
	const paths: string[] = [];

	for (let i = 0; i < pathCount; i++) {
		paths.push(`<path d="M${i},0 l1,1 l-1,1 z" fill="#00f"/>`);
	}

	return `
		<svg
			viewBox="0 0 10 10" width="10" height="10"
			version="1.1"
			baseProfile="full"
			xmlns="http://www.w3.org/2000/svg"
		>
			${paths.join('\n')}
		</svg>
	`;
};

export default makeTestSVG;
