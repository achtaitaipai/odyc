import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	let err = error as any;

	try {
		err = JSON.stringify(err);
	} catch (e) {}

	return {
		message: err
	};
};
