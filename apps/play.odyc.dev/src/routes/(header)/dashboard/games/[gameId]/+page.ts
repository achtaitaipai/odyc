import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';

export const load: PageLoad = async ({ params }) => {
	const { gameId } = params;
	const game = await Backend.getGame(gameId);
	return {
		game
	};
};
