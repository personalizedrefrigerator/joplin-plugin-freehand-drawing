/**
 * Returns true iff `a` is greater than `b`, where both `a` and `b` are
 * semver versions.
 */
const isVersionGreater = (a: string, b: string) => {
	const versionRegex = /^(\d+)\.(\d+)\.(\d+)(-.*)?$/;

	const parsedVersionA = versionRegex.exec(a);
	const parsedVersionB = versionRegex.exec(b);

	if (!parsedVersionA || !parsedVersionB) {
		console.warn(
			`Invalid version, ${parsedVersionA} or ${parsedVersionB} (expected number.number.number).`,
		);
		return false;
	}

	const majorA = parseInt(parsedVersionA[1]);
	const minorA = parseInt(parsedVersionA[2]);
	const patchA = parseInt(parsedVersionA[3]);
	const majorB = parseInt(parsedVersionB[1]);
	const minorB = parseInt(parsedVersionB[2]);
	const patchB = parseInt(parsedVersionB[3]);

	return (
		majorA > majorB ||
		(majorA === majorB && (minorA > minorB || (minorA === minorB && patchA > patchB)))
	);
};

export default isVersionGreater;
