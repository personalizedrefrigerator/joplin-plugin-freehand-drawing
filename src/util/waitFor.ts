// Wait a delay in milliseconds.
const waitFor = (timeout: number): Promise<void> => {
	return new Promise<void>((resolve) => {
		setTimeout(() => resolve(), timeout);
	});
};

export default waitFor;
