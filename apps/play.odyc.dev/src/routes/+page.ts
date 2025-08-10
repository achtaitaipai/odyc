import { stores } from '$lib/stores.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	await stores.fetchUser();

	if (!stores.user) {
		throw redirect(307, '/auth');
	} else {
		throw redirect(307, '/dashboard');
	}
};
