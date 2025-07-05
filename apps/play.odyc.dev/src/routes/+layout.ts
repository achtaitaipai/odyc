import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';
import { stores } from '$lib/stores.svelte';
import { Query, type Models } from 'appwrite';
import type { LayoutLoad } from './$types';
import type { Games } from '$lib/appwrite';

export const ssr = false;

export const load: LayoutLoad = async ({ depends }) => {
	depends(Dependencies.PROFILE);
	depends(Dependencies.USER);

	await stores.fetchUser();

	if (stores.user) {
		if (!stores.user.prefs.profileId) {
			const profile = await Backend.createProfile(stores.user.name);
			await Backend.updateProfileIdPrefs(profile.$id);
			await stores.fetchUser();
			await stores.fetchProfile(profile.$id);
		} else {
			await stores.fetchProfile(stores.user.prefs.profileId);
		}
	}

	let games: Models.DocumentList<Games> = {
		total: 0,
		documents: []
	};
	try {
		games = await Backend.listGames([Query.limit(50), Query.select(['$id', 'name', 'slug'])]);
	} catch {
		// Empty array
	}

	return {
		theme: stores.user?.prefs?.theme ?? 'dark',
		games
	};
};
