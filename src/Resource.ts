import joplin from 'api';
import TemporaryDirectory from './TemporaryDirectory';

import type FsExtra = require('fs-extra');
const fs = joplin.require('fs-extra') as typeof FsExtra;

// References for the Joplin REST API:
//  * The Draw.io plugin's usage of the data API:
//      https://github.com/marc0l92/joplin-plugin-drawio/blob/master/src/resources.ts
//  * The Joplin documentation:
//      https://joplinapp.org/api/references/plugin_api/classes/joplindata.html
//      https://joplinapp.org/api/references/rest_api/

interface ResourceInitializer {
	readonly tmpdir: TemporaryDirectory;

	resourceId: string;
	mime: string;
	title: string;

	fileExt?: string;
	tempfilePath?: string;
}

export class Resource {
	private readonly tmpdir: TemporaryDirectory;
	public readonly resourceId: string;
	public readonly mime: string;
	public readonly title: string;

	private readonly fileExt: string | undefined;
	private tempfilePath: string | null;

	private constructor(props: ResourceInitializer) {
		this.tmpdir = props.tmpdir;
		this.resourceId = props.resourceId;
		this.mime = props.mime;
		this.title = props.title;
		this.fileExt = props.fileExt;
		this.tempfilePath = props.tempfilePath ?? null;
	}

	// Fetch file data associated with this resource from the Joplin database
	public async getDataAsString(encoding: BufferEncoding = 'utf8'): Promise<string> {
		const data = await joplin.data.get(['resources', this.resourceId, 'file']);
		const stringData = Buffer.from(data.body).toString(encoding);

		return stringData;
	}

	public async updateData(data: string): Promise<void> {
		if (this.tempfilePath) {
			await fs.rm(this.tempfilePath);
			this.tempfilePath = null;
		}

		const tempfilePath = await this.tmpdir.newFile(data, this.fileExt);
		const fileData = [{ path: tempfilePath }];
		const query = null;
		const metadata = {
			mime: this.mime,
			title: this.title,
			updated_time: Date.now(),
			user_updated_time: Date.now(),

			// Remove the leading '.'
			file_extension: this.fileExt ? /^[.]?(.*)$/.exec(this.fileExt)![1] : null,
		}; // Don't update metadata

		await joplin.data.put(['resources', this.resourceId], query, metadata, fileData);
		this.tempfilePath = tempfilePath;
	}

	public htmlSafeTitle(): string {
		// Ref: https://stackoverflow.com/a/7382028
		return this.title
			.replace(/[&]/g, '&amp;')
			.replace(/[<]/g, '&lt;')
			.replace(/[>]/g, '&gt;')
			.replace(/["]/g, '&quot;')
			.replace(/[']/g, '&#39;');
	}

	// Given a URL in the form
	// file://.../resourceuuid#dataHere?dataHere
	// or
	// :/resourceuuid
	// returns a Resource representing the content
	// of that URL, **if the resource already exists**.
	// [fileExt] should include the leading '.'.
	public static async fromURL(
		tmpdir: TemporaryDirectory,
		url: string,
		fileExt: string,
		mimeType: string,
	): Promise<Resource | null> {
		// Extract the ID
		const fileURLMatch = /^(?:file|joplin[-a-z]+):\/\/.*\/([a-zA-Z0-9]+)[.]\w+(?:[?#]|$)/.exec(url);
		const resourceLinkMatch = /^:\/([a-zA-Z0-9]+)$/.exec(url);

		let resourceId: string | null = null;
		if (fileURLMatch) {
			resourceId = fileURLMatch[1];
		} else if (resourceLinkMatch) {
			resourceId = resourceLinkMatch[1];
		}

		if (resourceId === null) {
			return null;
		}

		// Fetch resource data
		// Note: Fetched data does not include a mime type/file_extension
		const resourceData = await joplin.data.get(['resources', resourceId]);
		if (!resourceData) {
			return null;
		}

		return new Resource({
			tmpdir,
			resourceId: resourceData.id,
			mime: resourceData.mime ?? mimeType,
			title: resourceData.title,
			fileExt: fileExt,

			// The resource was loaded through Joplin, and thus has no assoicated tempfile.
			tempfilePath: undefined,
		});
	}

	public static async ofData(
		tmpdir: TemporaryDirectory,
		data: string,
		title: string,
		fileExtension: string,
	): Promise<Resource> {
		const query = null;
		const metadata = {
			title: title.endsWith(fileExtension) ? title : `${title}${fileExtension}`,
			created_time: Date.now(),
			updated_time: Date.now(),
			file_extension: fileExtension,
		};
		const filePath = await tmpdir.newFile(data, fileExtension);
		const fileData = [{ path: filePath }];
		const result = await joplin.data.post(['resources'], query, metadata, fileData);
		const resource = new Resource({
			tmpdir: tmpdir,
			resourceId: result.id,
			mime: result.mime,
			title: result.title,
			fileExt: fileExtension,
		});
		return resource;
	}
}

export default Resource;
