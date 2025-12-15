import type { SettingControl } from '../settings/types.ts';

const dummySettingControl: SettingControl = {
	updateSetting: () => {},
	getSetting(_key) {
		return null;
	},
};

export default dummySettingControl;
