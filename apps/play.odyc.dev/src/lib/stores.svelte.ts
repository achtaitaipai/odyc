import type { Profiles } from './appwrite';
import { Backend, type BackendUser } from './backend';

let user = $state<BackendUser | undefined>(undefined);
let profile = $state<Profiles | undefined>(undefined);

export const stores = {
  get user() {
		return user;
	},
	fetchUser: async () => (user = await Backend.getUserSafe()),
	
	get profile() {
		return profile;
	},
	fetchProfile: async (profileId: string) => (profile = await Backend.getProfile(profileId))
};
