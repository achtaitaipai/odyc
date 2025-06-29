import type { PageLoad } from './$types';
import { stores } from '$lib/stores.svelte';
import { Query } from 'appwrite';
import { Backend } from '$lib/backend';

export const load: PageLoad = async ({ parent }) => {
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
		Backend.getGames(yourGamesQueries),
		Backend.getGames(collaborationGamesQueries),
		Backend.getCommunityHighlights()
	]);

	const gameLists = [
		yourGames.documents,
		collaborationGames.documents,
		communityHighlights.documents
	];

	const profileIds: string[] = [];
	for (const gameList of gameLists) {
		for (const game of gameList) {
			if (profileIds.includes(game.ownerProfileId)) continue;
			profileIds.push(game.ownerProfileId);
		}
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
