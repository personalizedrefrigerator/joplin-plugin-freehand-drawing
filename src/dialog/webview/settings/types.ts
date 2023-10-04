export interface SettingControl {
	updateSetting(key: string, value: string): void;
	getSetting(key: string): string | null;
}
