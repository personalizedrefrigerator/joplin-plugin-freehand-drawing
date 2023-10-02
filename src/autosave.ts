import joplin from 'api';

import type FsExtra = require('fs-extra');
import path = require('path');
const fs = joplin.require('fs-extra') as typeof FsExtra;

const getAutosaveDir = async () => {
	const dataDir = await joplin.plugins.dataDir();
	const autosavePath = path.join(dataDir, 'autosaves');
	return autosavePath;
};

const makeAutosaveDir = async () => {
	const autosavePath = await getAutosaveDir();
	if (!(await fs.pathExists(autosavePath))) {
		await fs.mkdir(autosavePath);
	}
	return autosavePath;
};

const autosaveFilename = 'autosave.svg';
export const autosave = async (data: string) => {
	const autosaveDir = await makeAutosaveDir();
	await fs.writeFile(path.join(autosaveDir, autosaveFilename), data);
};

export const clearAutosave = async () => {
	const autosavePath = await getAutosaveDir();
	if (await fs.pathExists(autosavePath)) {
		await fs.remove(autosavePath);
	}
};

export const hasAutosave = async () => {
	const autosavePath = await getAutosaveDir();
	if (await fs.pathExists(path.join(autosavePath, autosaveFilename))) {
		return true;
	}

	return false;
};

export const getAutosave = async (): Promise<string | null> => {
	if (await hasAutosave()) {
		const autosavePath = await getAutosaveDir();

		const data = await fs.readFile(path.join(autosavePath, autosaveFilename), 'utf-8');
		return data;
	}
	return null;
};
