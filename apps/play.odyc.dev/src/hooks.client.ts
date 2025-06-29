import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error }) => {
	let err = error as any;

	try {
		err = JSON.stringify(err);
	} catch {}

	return {
		message: err
	};
};
