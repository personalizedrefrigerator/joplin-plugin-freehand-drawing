import joplin from 'api';
import { tmpdir } from 'os';
import * as path from 'path';

import type FsExtra = require('fs-extra');
const fs = joplin.require('fs-extra') as typeof FsExtra;

const appTmpDirectories: TemporaryDirectory[] = [];

export default class TemporaryDirectory {
	private fileIdCounter: number;
	private constructor(private path: string | null) {
		this.fileIdCounter = 0;
		appTmpDirectories.push(this);
	}

	// Returns a new path to a temporary file in this directory.
	// [fileExtension], if given, should include the leading '.'.
	public nextFilepath(fileExtension: string = ''): string {
		if (this.path === null) {
			throw new Error('Temporary directory does not exist. Possible use after destroySync.');
		}

		this.fileIdCounter++;
		return path.join(this.path, `tmp${this.fileIdCounter}${fileExtension ?? ''}`);
	}

	public async newFile(data: string, fileExtension: string = ''): Promise<string> {
		const path = this.nextFilepath(fileExtension);
		const file = await fs.open(path, 'w');
		await fs.writeFile(file, data);
		await fs.close(file);
		return path;
	}

	// Destroys this directory and all files it contains
	public destroySync() {
		if (this.path) {
			fs.rmSync(this.path, { recursive: true });
			this.path = null;
		}
	}

	public static async create(): Promise<TemporaryDirectory> {
		const prefix = 'joplin-js-draw';
		const directoryPath = await fs.mkdtemp(path.join(tmpdir(), prefix));
		return new TemporaryDirectory(directoryPath);
	}
}

process.on('exit', () => {
	for (const dir of appTmpDirectories) {
		dir.destroySync();
	}
});
