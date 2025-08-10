import { stores } from '$lib/stores.svelte';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';

export let ssr = false;

export const load: LayoutLoad = async ({ depends }) => {
	depends(Dependencies.USER);

	await stores.fetchUser();

	if (stores.user) {
		throw redirect(307, '/');
	}

	return {};
};
