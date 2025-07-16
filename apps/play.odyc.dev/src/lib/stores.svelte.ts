import type { Profiles } from './appwrite';
import { Backend, type BackendUser } from './backend';
import { useTranslations, defaultLocale } from './i18n';

let user = $state<BackendUser | undefined>(undefined);
let profile = $state<Profiles | undefined>(undefined);

const t = $derived(useTranslations(user?.prefs?.selectedLocale ?? defaultLocale));

export const stores = {
	get user() {
		return user;
	},

	fetchUser: async () => (user = await Backend.getUserSafe()),

	get profile() {
		return profile;
	},

	fetchProfile: async (profileId: string) => (profile = await Backend.getProfile(profileId)),

	get t() {
		return t;
	}
};
