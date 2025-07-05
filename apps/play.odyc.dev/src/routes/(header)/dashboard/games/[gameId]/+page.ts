import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ params, depends }) => {
	depends(Dependencies.GAMES);

	const { gameId } = params;
	const game = await Backend.getGame(gameId);
	return {
		game
	};
};
