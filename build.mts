// -----------------------------------------------------------------------------
// This file is used to build the plugin file (.jpl) and plugin info (.json). It
// is recommended not to edit this file as it would be overwritten when updating
// the plugin framework. If you do make some changes, consider using an external
// JS file and requiring it here to minimize the changes. That way when you
// update, you can easily restore the functionality you've added.
// -----------------------------------------------------------------------------
//
// Modified: Switched to esbuild

/* eslint-disable no-console */

import * as esbuild from 'esbuild';
import { existsSync, readFileSync, statSync, writeFileSync, unlinkSync } from 'fs';
import * as crypto from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import * as glob from 'glob';
import * as tar from 'tar';
import { copyFile, mkdir, stat } from 'node:fs/promises';

// @ts-ignore -- import.meta.url *is* defined. This is a .mts file.
const __filename = new URL(import.meta.url).pathname;
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname);
const userConfigFilename = './plugin.config.json';
const userConfigPath = resolve(rootDir, userConfigFilename);
const distDir = resolve(rootDir, 'dist');
const srcDir = resolve(rootDir, 'src');
const publishDir = resolve(rootDir, 'publish');

const manifestPath = `${srcDir}/manifest.json`;
const packageJsonPath = `${rootDir}/package.json`;
const allPossibleScreenshotsType = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const manifest = readManifest(manifestPath);
const pluginArchiveFilePath = resolve(publishDir, `${manifest.id}.jpl`);
const pluginInfoFilePath = resolve(publishDir, `${manifest.id}.json`);

const getPackageJson = () => {
	return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
};

function validatePackageJson() {
	const content = getPackageJson();
	if (!content.name || content.name.indexOf('joplin-plugin-') !== 0) {
		console.warn(`WARNING: To publish the plugin, the package name should start with "joplin-plugin-" (found "${content.name}") in ${packageJsonPath}`);
	}

	if (!content.keywords || content.keywords.indexOf('joplin-plugin') < 0) {
		console.warn(`WARNING: To publish the plugin, the package keywords should include "joplin-plugin" (found "${JSON.stringify(content.keywords)}") in ${packageJsonPath}`);
	}

	if (content.scripts && content.scripts.postinstall) {
		console.warn(`WARNING: package.json contains a "postinstall" script. It is recommended to use a "prepare" script instead so that it is executed before publish. In ${packageJsonPath}`);
	}
}

function fileSha256(filePath: string) {
	const content = readFileSync(filePath);
	return crypto.createHash('sha256').update(content).digest('hex');
}

function currentGitInfo() {
	try {
		let branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
		const commit = execSync('git rev-parse HEAD', { stdio: 'pipe' }).toString().trim();
		if (branch === 'HEAD') branch = 'master';
		return `${branch}:${commit}`;
	} catch (error) {
		const messages = error.message ? error.message.split('\n') : [''];
		console.info('Could not get git commit (not a git repo?):', messages[0].trim());
		console.info('Git information will not be stored in plugin info file');
		return '';
	}
}

function validateCategories(categories: string[]) {
	if (!categories) return;
	if ((categories.length !== new Set(categories).size)) throw new Error('Repeated categories are not allowed');
	categories.forEach(category => {
		const allPossibleCategories = [
			"appearance", "developer tools", "productivity",
			"themes", "integrations", "viewer", "search", "tags",
			"editor", "files", "personal knowledge management",
		];
		if (!allPossibleCategories.includes(category)) {
            throw new Error(`${category} is not a valid category. Please make sure that the category name is lowercase. Valid categories are: \n${allPossibleCategories}\n`);
        }
	});
}

type Screenshot = { src: string };
function validateScreenshots(screenshots: Screenshot[]) {
	if (!screenshots) return;
	screenshots.forEach(screenshot => {
		if (!screenshot.src) throw new Error('You must specify a src for each screenshot');

		const screenshotType = screenshot.src.split('.').pop() ?? '';
		if (!allPossibleScreenshotsType.includes(screenshotType)) throw new Error(`${screenshotType} is not a valid screenshot type. Valid types are: \n${allPossibleScreenshotsType}\n`);

		const screenshotPath = resolve(rootDir, screenshot.src);
		// Max file size is 1MB
		const fileMaxSize = 1024;
		const fileSize = statSync(screenshotPath).size / 1024;
		if (fileSize > fileMaxSize) throw new Error(`Max screenshot file size is ${fileMaxSize}KB. ${screenshotPath} is ${fileSize}KB`);
	});
}

function readManifest(manifestPath: string) {
	const content = readFileSync(manifestPath, 'utf8');
	const output = JSON.parse(content);
	if (!output.id) throw new Error(`Manifest plugin ID is not set in ${manifestPath}`);
	validateCategories(output.categories);
	validateScreenshots(output.screenshots);
	return output;
}

async function createPluginArchive(sourceDir: string, destPath: string) {
	const distFiles = glob.sync(`${sourceDir}/**/*`, { nodir: true })
		.map(f => f.substring(sourceDir.length + 1));

	if (!distFiles.length) throw new Error('Plugin archive was not created because the "dist" directory is empty');
    if (existsSync(destPath)) {
	    unlinkSync(destPath);
    }
    if (!existsSync(publishDir)) {
        await mkdir(publishDir, {recursive: true});
    }

	tar.create(
		{
			strict: true,
			portable: true,
			file: destPath,
			cwd: sourceDir,
			sync: true,
		},
		distFiles
	);

	console.info(`Plugin archive has been created in ${destPath}`);
}

const writeManifest = (manifestPath: string, content: string) => {
	writeFileSync(manifestPath, JSON.stringify(content, null, '\t'), 'utf8');
};

function createPluginInfo(manifestPath: string, destPath: string, jplFilePath: string) {
	const contentText = readFileSync(manifestPath, 'utf8');
	const content = JSON.parse(contentText);
	content._publish_hash = `sha256:${fileSha256(jplFilePath)}`;
	content._publish_commit = currentGitInfo();
	writeManifest(destPath, content);
}

async function onBuildCompleted() {
    await createPluginArchive(distDir, pluginArchiveFilePath);
    createPluginInfo(manifestPath, pluginInfoFilePath, pluginArchiveFilePath);
    validatePackageJson();
}

async function bundle() {
    await esbuild.build({
        entryPoints: ['./src/index.ts'],
        outfile: join(distDir, 'index.js'),
        bundle: true,
        platform: 'node',
        target: 'node22',
    });
}

function resolveExtraScriptPath(name: string, isLibrary: boolean) {
	const relativePath = `./src/${name}`;

	const fullPath = resolve(`${rootDir}/${relativePath}`);
	if (!existsSync(fullPath)) throw new Error(`Could not find extra script: "${name}" at "${fullPath}"`);

	return relativePath;
}

async function buildExtraScripts(userConfig: any) {
	const extraScripts = [
		...(userConfig?.extraScripts ?? []),
		...(userConfig?.extraStandaloneScripts ?? []),
	];
	if (!extraScripts.length) return;

	const processScripts = async (scripts: string[], isLibrary: boolean) => {
        await esbuild.build({
            entryPoints: scripts.map(script => resolveExtraScriptPath(script, isLibrary)),
            outdir: distDir,
            outbase: srcDir,
            bundle: true,
            format: isLibrary ? 'cjs' : 'iife',
        });
	};
	await processScripts(userConfig.extraScripts, true);
	await processScripts(userConfig.extraStandaloneScripts, false);
}

const increaseVersion = (version: string) => {
	try {
		const s = version.split('.');
		const d = Number(s[s.length - 1]) + 1;
		s[s.length - 1] = `${d}`;
		return s.join('.');
	} catch (error) {
		error.message = `Could not parse version number: ${version}: ${error.message}`;
		throw error;
	}
};

const updateVersion = () => {
	const packageJson = getPackageJson();
	packageJson.version = increaseVersion(packageJson.version);
	writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

	const manifest = readManifest(manifestPath);
	manifest.version = increaseVersion(manifest.version);
	writeManifest(manifestPath, manifest);

	if (packageJson.version !== manifest.version) {
		console.warn(`Version numbers have been updated but they do not match: package.json (${packageJson.version}), manifest.json (${manifest.version}). Set them to the required values to get them in sync.`);
	}
};

const copyAssets = async () => {
    const assets = await glob.glob('**/*', {
        ignore: '**/*.{ts,tsx}',
        cwd: srcDir,
    });
    for (const asset of assets) {
        const srcPath = join(srcDir, asset);
        const fileStat = await stat(srcPath);
        if (fileStat.isFile()) {
            await copyFile(srcPath, join(distDir, asset));
        } else {
            await mkdir(join(distDir, asset), { recursive: true });
        }
    }
};

async function build() {
    const userConfig = {
        extraScripts: [],
        ...(existsSync(userConfigPath) ? JSON.parse(readFileSync(userConfigFilename, 'utf8')) : {}),
    };

    await bundle();
    await buildExtraScripts(userConfig);
    await copyAssets();
    await onBuildCompleted();
}

const command = process.argv[2];
if (command === 'build') {
	build();
} else if (command === 'bump-version') {
	updateVersion();
} else {
	console.warn('Unknown command', command);
	process.exit(1);
}
