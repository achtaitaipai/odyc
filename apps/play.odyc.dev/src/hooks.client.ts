import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error }) => {
	let err = error as any;

	// Keep for debugging pruposes
	console.log(err);

	try {
		err = JSON.stringify(err);
	} catch {
		// Ignore; send as is
	}

	return {
		message: err
	};
};
