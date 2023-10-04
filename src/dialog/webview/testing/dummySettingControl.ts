import { SettingControl } from '../settings/types';

const dummySettingControl: SettingControl = {
	updateSetting: jest.fn(),
	getSetting(_key) {
		return null;
	},
};

export default dummySettingControl;
