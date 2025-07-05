import type { PageLoad } from './$types';
import { stores } from '$lib/stores.svelte';
import { Query } from 'appwrite';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ parent, depends }) => {
	depends(Dependencies.GAMES);
	depends(Dependencies.HIGHLIGHTS);

	await parent();

	const yourGamesQueries = [
		Query.limit(4),
		Query.equal('ownerProfileId', stores.profile?.$id ?? ''),
		Query.orderDesc('$updatedAt'),
		Query.orderDesc('$createdAt')
	];

	const collaborationGamesQueries = [
		Query.limit(4),
		Query.contains('collaboratorProfileIds', stores.profile?.$id ?? ''),
		Query.orderDesc('$updatedAt'),
		Query.orderDesc('$createdAt')
	];

	const [yourGames, collaborationGames, communityHighlights] = await Promise.all([
		Backend.listGames(yourGamesQueries),
		Backend.listGames(collaborationGamesQueries),
		Backend.getCommunityHighlights()
	]);

	const profileIds: string[] = [];
	for (const game of communityHighlights.documents) {
		if (profileIds.includes(game.ownerProfileId)) continue;
		profileIds.push(game.ownerProfileId);
	}

	const profiles =
		profileIds.length <= 0
			? {
					total: 0,
					documents: []
				}
			: await Backend.listProfiles(profileIds);

	return {
		yourGames,
		collaborationGames,
		yourGamesQueries,
		collaborationGamesQueries,
		communityHighlights,
		profiles
	};
};
