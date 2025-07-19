import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ params, depends }) => {
	depends(Dependencies.GAMES);

	const { slug } = params;

	let game;

	await Promise.all([
		(async () => {
			try {
				game = await Backend.getGame(slug);
			} catch (err) {
				// All good, next attempt will look elsewhere
			}
		})(),
		(async () => {
			try {
				game = await Backend.getGameBySlug(slug);
			} catch (err) {
				// All good, next attempt will look elsewhere
			}
		})()
	]);

	if (!game) {
		throw new Error(`Game not found.`);
	}

	return {
		game
	};
};
