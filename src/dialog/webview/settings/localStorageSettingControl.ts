import { SettingControl } from './types';

const localStorageSettingControl: SettingControl = {
	updateSetting(key, value) {
		localStorage.setItem(key, value);
	},

	getSetting(key) {
		return localStorage.getItem(key);
	},
};
export default localStorageSettingControl;
