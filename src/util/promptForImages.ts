import joplin from 'api';
import { basename, extname } from 'path';
import TemporaryDirectory from '../TemporaryDirectory';
import type { TransferableImageData } from '../types';
import localization from '../localization';
import isVersionGreater from './isVersionGreater';

type TaskRecord = {
	id: number;
	task: Promise<TransferableImageData[] | null>;
	cancel: () => void;
};

let nextTaskId = 0;
const runningTasks = new Map<number, TaskRecord>();

const shouldLoadLargePdf = async (pageCount: number) => {
	if (pageCount < 20) return true;

	const dialogResult = await joplin.views.dialogs.showMessageBox(
		localization.loadLargePdf(pageCount),
	);
	const okIndex = 0;
	return dialogResult === okIndex;
};

const getFilters = async () => {
	const filters = [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif'] }];

	const supportsPdf = isVersionGreater((await joplin.versionInfo())?.version, '3.0.2');
	if (supportsPdf) {
		filters.push({ name: 'PDFs', extensions: ['pdf'] });
	}

	filters.push({ name: 'All Files', extensions: ['*'] });
};

export const promptForImages = (tempDir: TemporaryDirectory) => {
	const taskId = nextTaskId++;
	let cancelled = false;
	const taskRecord = {
		id: taskId,
		cancel: () => {
			cancelled = true;
		},
		task: (async () => {
			try {
				const filePaths: string[] = await joplin.views.dialogs.showOpenDialog({
					properties: ['openFile', 'multiSelections'],
					filters: await getFilters(),
				});

				if (!filePaths) {
					return null;
				}

				const images: TransferableImageData[] = [];
				for (const path of filePaths) {
					if (cancelled) return null;

					if (extname(path).toLowerCase() === '.pdf') {
						const pdfInfo = await joplin.imaging.getPdfInfoFromPath(path);

						if (!(await shouldLoadLargePdf(pdfInfo.pageCount))) {
							cancelled = true;
							return null;
						}

						const pageHandles: string[] = [];
						const step = 30;
						for (let i = 0; i <= pdfInfo.pageCount; i += step) {
							const minPage = i + 1;
							const maxPage = Math.min(pdfInfo.pageCount, i + step);
							const handles = await joplin.imaging.createFromPdfPath(path, { minPage, maxPage });
							pageHandles.push(...handles);

							if (cancelled) return null;
						}
						for (const handle of pageHandles) {
							if (cancelled) return null;

							const pdfPagePath = tempDir.nextFilepath('.jpg');
							await joplin.imaging.toJpgFile(handle, pdfPagePath);
							images.push({
								path: pdfPagePath,
								name: basename(pdfPagePath),
								mime: 'image/jpeg',
							});
						}
					} else {
						images.push({ path, name: basename(path) });
					}
				}
				return images;
			} finally {
				runningTasks.delete(taskId);
			}
		})(),
	};
	runningTasks.set(taskId, taskRecord);

	return taskRecord;
};

export const taskById = (id: number) => {
	return runningTasks.get(id);
};

export default promptForImages;
