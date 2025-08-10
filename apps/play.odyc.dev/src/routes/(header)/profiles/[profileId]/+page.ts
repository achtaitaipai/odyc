import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';
import { Query } from 'appwrite';

export const load: PageLoad = async ({ params, depends }) => {
	depends(Dependencies.PROFILES);

	const { profileId } = params;

	const gamesQueries = [Query.equal('ownerProfileId', profileId)];

	const [profile, games] = await Promise.all([
		Backend.getProfile(profileId),
		Backend.listGames(gamesQueries)
	]);

	return {
		profile,
		games,
		gamesQueries
	};
};
