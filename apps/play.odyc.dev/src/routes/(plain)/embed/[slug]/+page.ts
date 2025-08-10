import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';
import type { Games } from '$lib/appwrite';

export const load: PageLoad = async ({ params, depends }) => {
	depends(Dependencies.GAMES);

	const { slug } = params;

	let game: null | Games = null;

	async function fetchGameById() {
		try {
			return await Backend.getGame(slug);
		} catch (err) {
			// All good, next attempt will look elsewhere
		}
		return null;
	}

	async function fetchGameBySlug() {
		try {
			return await Backend.getGameBySlug(slug);
		} catch (err) {
			// All good, next attempt will look elsewhere
		}
		return null;
	}

	game = game ?? (await fetchGameById());
	game = game ?? (await fetchGameBySlug());

	if (!game) {
		throw new Error(`Game not found.`);
	}

	return {
		game
	};
};
