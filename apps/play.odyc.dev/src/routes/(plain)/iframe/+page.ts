import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const version = url.searchParams.get('version') ?? 'latest';
	return {
		version
	};
};
