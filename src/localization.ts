interface AppLocalization {
	insertDrawing: string;
	insertDrawingInNewWindow: string;
	restoreFromAutosave: string;
	deleteAutosave: string;
	noSuchAutosaveExists: string;
	discardChanges: string;
	defaultImageTitle: string;

	edit: string;
	close: string;
	saveAndClose: string;

	overwriteExisting: string;
	saveAsNewDrawing: string;
	clickBelowToContinue: string;
	discardUnsavedChanges: string;
	resumeEditing: string;
	saveAndResumeEditing: string;
	saveChanges: string;
	exitInstructions: string;

	settingsPaneDescription: string;
	setting__disableFullScreen: string;
	setting__disableFullScreenDescription: string;
	setting__autosaveIntervalSettingLabel: string;
	setting__autosaveIntervalSettingDescription: string;
	setting__themeLabel: string;
	setting__toolbarTypeLabel: string;
	setting__toolbarTypeDescription: string;
	setting__descriptionTemplate: string;

	// Labels for the toolbar type setting
	toolbarTypeDefault: string;
	toolbarTypeSidebar: string;
	toolbarTypeDropdown: string;

	// Labels for the theme setting
	styleMatchJoplin: string;
	styleJsDrawLight: string;
	styleJsDrawDark: string;

	// Label for the keyboard shortcuts setting
	setting__keyboardShortcuts: string;

	// File picker labels
	images: string;
	pdfs: string;
	allFiles: string;

	loadLargePdf: (pageCount: number) => string;
	notAnEditableImage: (resourceId: string, resourceType: string) => void;
}

const defaultStrings: AppLocalization = {
	insertDrawing: 'Insert Drawing',
	insertDrawingInNewWindow: 'Insert drawing in new window',
	restoreFromAutosave: 'Restore from autosaved drawing',
	deleteAutosave: 'Delete all autosaved drawings',
	noSuchAutosaveExists: 'No autosave exists',
	discardChanges: 'Discard changes',
	defaultImageTitle: 'Freehand Drawing',

	edit: 'Edit',
	close: 'Close',
	saveAndClose: 'Save and close',

	overwriteExisting: 'Overwrite existing',
	saveAsNewDrawing: 'Save as a new drawing',
	clickBelowToContinue: 'Done! Click below to continue.',
	discardUnsavedChanges: 'Discard unsaved changes?',
	resumeEditing: 'Resume editing',
	saveAndResumeEditing: 'Save and resume editing',
	saveChanges: 'Save changes',
	exitInstructions: 'All changes saved! Click below to exit.',

	settingsPaneDescription: 'Settings for the Freehand Drawing image editor.',
	setting__disableFullScreen: 'Dialog mode',
	setting__disableFullScreenDescription:
		'Enabling this setting causes the editor to only partially fill the Joplin window.',
	setting__autosaveIntervalSettingLabel: 'Autosave interval (minutes)',
	setting__autosaveIntervalSettingDescription:
		'Adjusts how often a backup copy of the current drawing is created. The most recent autosave can be restored by searching for ":restore autosave" in the command palette (ctrl+shift+p or cmd+shift+p on MacOS) and clicking "Restore from autosaved drawing". If this setting is set to zero, autosaves are created every two minutes.',
	setting__themeLabel: 'Theme',
	setting__toolbarTypeLabel: 'Toolbar type',
	setting__toolbarTypeDescription:
		'This setting switches between possible toolbar user interfaces for the image editor.',
	setting__keyboardShortcuts: 'Keyboard shortcuts',
	setting__descriptionTemplate: 'Default ALT text template',

	toolbarTypeDefault: 'Default',
	toolbarTypeSidebar: 'Sidebar',
	toolbarTypeDropdown: 'Dropdown',

	styleMatchJoplin: 'Match Joplin',
	styleJsDrawLight: 'Light',
	styleJsDrawDark: 'Dark',

	images: 'Images',
	pdfs: 'PDFs',
	allFiles: 'All Files',

	loadLargePdf: (pageCount: number) =>
		`A selected file is a large PDF (${pageCount} pages). Loading it may take some time and increase the size of the current drawing. Continue?`,
	notAnEditableImage: (resourceId: string, resourceType: string) =>
		`Resource ${resourceId} is not an editable image. Unable to edit resource of type ${resourceType}.`,
};

const localizations: Record<string, AppLocalization> = {
	de: {
		...defaultStrings,
		insertDrawing: 'Zeichnung einfügen',
		restoreFromAutosave: 'Automatische Sicherung wiederherstellen',
		deleteAutosave: 'Alle automatischen Sicherungen löschen',
		noSuchAutosaveExists: 'Keine automatischen Sicherungen vorhanden',
		discardChanges: 'Änderungen verwerfen',
		defaultImageTitle: 'Freihand-Zeichnen',

		edit: 'Bearbeiten',
		close: 'Schließen',

		overwriteExisting: 'Existierende Zeichnung überschreiben',
		saveAsNewDrawing: 'Als neue Zeichnung speichern',
		clickBelowToContinue: 'Fertig! Klicke auf „Ok“ um fortzufahen.',
		discardUnsavedChanges: 'Ungespeicherte Änderungen verwerfen?',
		resumeEditing: 'Bearbeiten fortfahren',

		notAnEditableImage: (resourceId: string, resourceType: string) =>
			`Die Ressource ${resourceId} ist kein bearbeitbares Bild. Ressource vom Typ ${resourceType} kann nicht bearbeitet werden.`,
	},
	en: defaultStrings,
	es: {
		...defaultStrings,
		insertDrawing: 'Añada dibujo',
		restoreFromAutosave: 'Resturar al autoguardado',
		deleteAutosave: 'Borrar el autoguardado',
		noSuchAutosaveExists: 'No autoguardado existe',
		discardChanges: 'Descartar cambios',
		defaultImageTitle: 'Dibujo',

		edit: 'Editar',
		close: 'Cerrar',
		saveAndClose: 'Guardar y cerrar',

		overwriteExisting: 'Sobrescribir existente',
		saveAsNewDrawing: 'Guardar como dibujo nuevo',
		clickBelowToContinue: 'Guardado. Ponga «ok» para continuar.',
		discardUnsavedChanges: '¿Descartar cambios no guardados?',
		resumeEditing: 'Continuar editando',
		saveAndResumeEditing: 'Guardar y continuar editando',
	},
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
	const localeSep = language.indexOf('-');

	if (localeSep !== -1) {
		languages.push(language.substring(0, localeSep));
	}
}

for (const locale of languages) {
	if (locale in localizations) {
		localization = localizations[locale];
		break;
	}
}

if (!localization) {
	console.log('No supported localization found. Falling back to default.');
	localization = defaultStrings;
}

export default localization!;
