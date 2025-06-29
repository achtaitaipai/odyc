import { Dependencies } from '$lib/constants';
import { stores } from '$lib/stores.svelte';
import type { LayoutLoad } from './$types';

export let ssr = false;

export const load: LayoutLoad = async ({ depends }) => {
	depends(Dependencies.USER);

	await stores.fetchUser();

	return {
		theme: stores.user?.prefs?.theme ?? 'dark'
	};
};
