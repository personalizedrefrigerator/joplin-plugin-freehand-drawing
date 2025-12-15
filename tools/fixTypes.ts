import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

// This script updates imports in api/ to make them compatible with ES Modules.
// The upstream api/ types use syntax that is incompatible with ES Modules.
const fixTypes = async (apiDirectory: string) => {
	const apiFiles = await readdir(apiDirectory, { recursive: true });
	for (let filePath of apiFiles) {
		filePath = join(apiDirectory, filePath);
		console.log(filePath);

		const fileStats = await stat(filePath);
		if (fileStats.isFile() && filePath.endsWith('.ts')) {
			const originalContent = await readFile(filePath, 'utf-8');
			const updatedContent = originalContent
				// Toplevel imports
				.replace(/import (.+) from '([^']+)';/g, (original, imported, source) => {
					if (!source.startsWith('./') || source.endsWith('.ts')) {
						return original;
					}

					return `import ${imported} from '${source}.ts';`;
				})
				// Inline imports
				.replace(/import\(["'].\/([^'"]+)["']\)/g, (original, source) => {
					if (source.endsWith('.ts')) {
						return original;
					} else {
						return `import('./${source}.ts')`;
					}
				});
			await writeFile(filePath, updatedContent, { encoding: 'utf-8' });
		}
	}
};

const apiDirectory = process.argv[2];
if (!apiDirectory) throw new Error('Missing command line option: apiDirectory');
void fixTypes(apiDirectory);
