import { stores } from '$lib/stores.svelte';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	await parent();

	if (!stores.user) {
		throw redirect(307, '/');
	}

	return {};
};
