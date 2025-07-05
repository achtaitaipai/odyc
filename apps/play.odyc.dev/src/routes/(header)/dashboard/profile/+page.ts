import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { stores } from '$lib/stores.svelte';

export const load: PageLoad = async ({ parent }) => {
	await parent();
	throw redirect(307, '/profiles/' + stores.profile?.$id);
};
