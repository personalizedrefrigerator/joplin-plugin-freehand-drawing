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
	notAnEditableImage: (resourceId: string, resourceType: string) => string;
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

const localizations: Record<string, Partial<AppLocalization>> = {
	de: {
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
	hr: {
		insertDrawing: 'Umetni crtež',
		insertDrawingInNewWindow: 'Umetni crtež u novom prozoru',
		restoreFromAutosave: 'Obnovi iz automatski spremljenog crteža',
		deleteAutosave: 'Izbriši sve automatski spremljene crteže',
		noSuchAutosaveExists: 'Ne postoji automatski spremljeni crtež',
		discardChanges: 'Odbaci promjene',
		defaultImageTitle: 'Prostoručni crtež',

		edit: 'Uredi',
		close: 'Zatvori',
		saveAndClose: 'Spremi i zatvori',

		overwriteExisting: 'Prepiši postojeće',
		saveAsNewDrawing: 'Spremi kao novi crtež',
		clickBelowToContinue: 'Gotovo! Klikni dolje za nastavak.',
		discardUnsavedChanges: 'Odbaciti nespremljene promjene?',
		resumeEditing: 'Nastavi uređivati',
		saveAndResumeEditing: 'Spremi i nastavi uređivati',
		saveChanges: 'Spremi promjene',
		exitInstructions: 'Sve promjene su spremljene! Klikni dolje za izlaz.',

		settingsPaneDescription: 'Postavke uređivača crteža.',
		setting__disableFullScreen: 'Modus dijaloga',
		setting__disableFullScreenDescription:
			'Uključivanjem ove postavke će uređivač ispuniti samo dio Joplinovog prozora.',
		setting__autosaveIntervalSettingLabel: 'Interval automatskog spremanja (minute)',
		setting__autosaveIntervalSettingDescription:
			'Prilagođava učestalost stvaranja sigurnosnih kopija trenutačnog crteža. Najnoviji automatski spremljeni crtež se može obnoviti pretraživanjem „:restore autosave” u paleti naredbi (ctrl+shift+p ili cmd+shift+p na MacOS-u) i klikom na „Obnovi iz automatski spremljenog crteža”. Ako je ova postavka postavljena na nulu, automatska spremanja se izvode svake dvije minute.',
		setting__themeLabel: 'Tema',
		setting__toolbarTypeLabel: 'Vrsta alatne trake',
		setting__toolbarTypeDescription:
			'Ova postavka omogućuje prebacivanje između mogućih korisničkih sučelja alatnih traka za uređivač slika.',
		setting__keyboardShortcuts: 'Tipkovni prečaci',

		toolbarTypeDefault: 'Zadano',
		toolbarTypeSidebar: 'Bočna traka',
		toolbarTypeDropdown: 'Padajući izbornik',

		styleMatchJoplin: 'Uskladi s Joplinom',
		styleJsDrawLight: 'Svijetla',
		styleJsDrawDark: 'Tamna',

		images: 'Slike',
		pdfs: 'PDF-ovi',
		allFiles: 'Sve datoteke',

		loadLargePdf: (pageCount: number) =>
			`Jedna odabrana datoteka je veliki PDF (${pageCount} stranica). Učitavanje može potrajati i povećati veličinu trenutačnog crteža. Želiš li nastaviti?`,
		notAnEditableImage: (resourceId: string, resourceType: string) =>
			`Resurs ${resourceId} nije slika koja se može uređivati. Nije moguće urediti resurs vrste ${resourceType}.`,
	};
	ro: {
		insertDrawing: 'Inserează un desen',
		insertDrawingInNewWindow: 'Inserează un desen într-o fereastră nouă',
		restoreFromAutosave: 'Restaurează dintr-un desen salvat automat',
		deleteAutosave: 'Șterge toate desenele salvate automat',
		noSuchAutosaveExists: 'Nicio salvare automată nu există',
		discardChanges: 'Anulează modificările',
		defaultImageTitle: 'Desen liber',

		edit: 'Editează',
		close: 'Închide',
		saveAndClose: 'Salvează și închide',

		overwriteExisting: 'Suprascrie existent',
		saveAsNewDrawing: 'Salvează ca desen nou',
		clickBelowToContinue: 'Gata! Fă clic mai jos pentru a continua.',
		discardUnsavedChanges: 'Anulezi modificările nesalvate?',
		resumeEditing: 'Continuă editarea',
		saveAndResumeEditing: 'Salvează și continuă editarea',
		saveChanges: 'Salvează modificările',
		exitInstructions: 'Toate modificările au fost salvate! Fă clic mai jos pentru a ieși.',

		settingsPaneDescription: 'Setări pentru editorul de imagine liber.',
		setting__disableFullScreen: 'Mod dialog',
		setting__disableFullScreenDescription:
			'Activarea acestei opțiuni face ca editorul să acopere doar parțial fereastra Joplin.',
		setting__autosaveIntervalSettingLabel: 'Interval salvare automată (minute)',
		setting__autosaveIntervalSettingDescription:
			'Ajustează cât de des se face o copie de siguranță a desenului curent. Cea mai recentă versiune salvată automat poate fi restaurată căutând după ":restore autosave" în paleta de comenzi (Ctrl+Shift+P sau Cmd+Shift+P pe MacOS) și făcând clic pe „Restaurează dintr-un desen salvat automat”. Dacă acestă setare este 0, salvările automate sunt create la fiecare 2 minute.',
		setting__themeLabel: 'Temă',
		setting__toolbarTypeLabel: 'Tip bară de instrumente',
		setting__toolbarTypeDescription:
			'Această setare comută între posibilele interfețe pentru editorul de imagine.',
		setting__keyboardShortcuts: 'Scurtături de la tastatură',

		toolbarTypeDefault: 'Implicit',
		toolbarTypeSidebar: 'Bară laterală',
		toolbarTypeDropdown: 'Casete derulante',

		styleMatchJoplin: 'La fel ca Joplin',
		styleJsDrawLight: 'Luminoasă',
		styleJsDrawDark: 'Întunecată',

		images: 'Imagini',
		pdfs: 'PDF-uri',
		allFiles: 'Toate fișierele',

		loadLargePdf: (pageCount: number) =>
			`Un fișier PDF selectat este un fișier mare (${pageCount} de pagini). Încărcarea lui ar putea dura ceva timp și să crească dimensiunea desenului curent. Continui?`,
		notAnEditableImage: (resourceId: string, resourceType: string) =>
			`Resursa ${resourceId} nu este o imagine editabilă. Nu se poate edita resursa de tipul ${resourceType}.`,
	},
	sk: {
		insertDrawing: 'Vložiť kresbu',
		insertDrawingInNewWindow: 'Vložiť kresbu do nového okna',
		restoreFromAutosave: 'Obnoviť z automaticky uloženej kresby',
		deleteAutosave: 'Vymazať všetky automaticky uložené kresby',
		noSuchAutosaveExists: 'Neexistujú žiadne automaticky uložené',
		discardChanges: 'Zrušiť zmeny',
		defaultImageTitle: 'Kresba voľnou rukou',

		edit: 'Upraviť',
		close: 'Zavrieť',
		saveAndClose: 'Uložiť a zavrieť',

		overwriteExisting: 'Prepísať existujúcu',
		saveAsNewDrawing: 'Uložiť ako novú kresbu',
		clickBelowToContinue: 'Hotovo! Kliknite nižšie pre pokračovanie.',
		discardUnsavedChanges: 'Zrušiť neuložené zmeny?',
		resumeEditing: 'Pokračovať v úprave',
		saveAndResumeEditing: 'Uložiť a pokračovať v úpravách',
		saveChanges: 'Uložiť zmeny',
		exitInstructions: 'Všetky zmeny boli uložené! Kliknite nižšie pre ukončenie.',

		settingsPaneDescription: 'Nastavenia pre grafický editor Kresba voľnou rukou.',
		setting__disableFullScreen: 'Dialógový režim',
		setting__disableFullScreenDescription:
			'Aktivácia tohto nastavenia spôsobí, že editor vyplní okno Joplin len čiastočne.',
		setting__autosaveIntervalSettingLabel: 'Interval automatického ukladania (v minútach)',
		setting__autosaveIntervalSettingDescription:
			'Nastaví, ako často sa vytvára záložná kópia aktuálnej kresby. Posledné automatické uloženie je možné obnoviť vyhľadaním „:restore autosave“ v palete príkazov (ctrl+shift+p alebo cmd+shift+p v systéme MacOS) a kliknutím na „Obnoviť z automaticky uloženej kresby“. Ak je toto nastavenie nastavené na nulu, automatické uloženia sa vytvárajú každé dve minúty.',
		setting__themeLabel: 'Téma',
		setting__toolbarTypeLabel: 'Typ panela nástrojov',
		setting__toolbarTypeDescription:
			'Toto nastavenie prepína medzi možnými používateľskými rozhraniami panela nástrojov pre grafický editor.',
		setting__keyboardShortcuts: 'Klávesové skratky',

		toolbarTypeDefault: 'Predvolené',
		toolbarTypeSidebar: 'Bočný panel',
		toolbarTypeDropdown: 'Rozbaľovacie menu',

		styleMatchJoplin: 'Rovnaká ako Joplin',
		styleJsDrawLight: 'Svetlá',
		styleJsDrawDark: 'Tmavá',

		images: 'Obrázky',
		pdfs: 'PDF súbory',
		allFiles: 'Všetky súbory',

		loadLargePdf: (pageCount: number) =>
			`Vybraný súbor je veľký PDF súbor (${pageCount} strán). Jeho načítanie môže trvať nejaký čas a zvýšiť veľkosť aktuálnej kresby. Pokračovať?`,
		notAnEditableImage: (resourceId: string, resourceType: string) =>
			`Zdroj ${resourceId} nie je upraviteľný obrázok. Nie je možné upraviť zdroj typu ${resourceType}.`,
	},
};

let localization: Partial<AppLocalization> | undefined;
let supportedLanguages: string[] = [];
const setLocaleInternal = (supportedLocales: readonly string[]) => {
	const languages = [...supportedLocales];

	for (let language of supportedLocales) {
		// Joplin locales may use ro_RO format, navigator.languages locales
		// use ro-RO format. Normalize:
		language = language.replace('_', '-');
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

	supportedLanguages = languages;
};

let localizationSet = false;
export const setLocale = (supportedLocales: readonly string[] | string) => {
	if (typeof supportedLocales === 'string') {
		supportedLocales = [supportedLocales];
	}

	setLocaleInternal(supportedLocales);
	localizationSet = true;
};
setLocale(navigator.languages);

export const getLocales = () => {
	return [...supportedLanguages];
};

export default new Proxy(defaultStrings, {
	get(_target, prop) {
		if (!localizationSet) {
			console.warn(
				'Accessing language data without a localization set. The default Electron locale will be used.',
			);
		}
		const propAsKey = prop as keyof typeof defaultStrings;
		return localization?.[propAsKey] ?? defaultStrings[propAsKey];
	},
});
