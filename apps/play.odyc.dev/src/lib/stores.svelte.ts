import { Backend, type BackendUser } from './backend';

let user = $state<BackendUser | undefined>(undefined);

export const stores = {
	get user() {
		return user;
	},
	fetchUser: async () => (user = await Backend.getUserSafe())
};
