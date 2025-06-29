import { goto, invalidate } from '$app/navigation';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';
import { stores } from '$lib/stores.svelte';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// TODO: If need comes, add ability to show verbose errors to user
// TODO: Remember last path
export const load: PageLoad = async ({ params, url }) => {
	const userId = url.searchParams.get('userId') ?? '';
	const secret = url.searchParams.get('secret') ?? '';
	const errorMsg = url.searchParams.get('error') ?? '';
	const href = url.searchParams.get('href') ?? '';

	if (errorMsg) {
		throw error(400, errorMsg);
	}

	if (!userId || !secret) {
		throw error(400, 'This sign in URL is no longer valid. Please try again.');
	}

	await Backend.signInFinish(userId, secret);

	// TODO: Core quality; use invalidate()
	await stores.fetchUser(); // Doing invalidate doesnt work here for some reason

	throw redirect(307, '/'); // Success
};
