import type { PageLoad } from './$types';
import { Backend } from '$lib/backend';
import { Dependencies } from '$lib/constants';
import { getExamples } from '$lib/load-examples';

type Example = ReturnType<typeof getExamples>[number];

export const load: PageLoad = async ({ params, depends }) => {
	depends(Dependencies.GAMES);

	const { gameId } = params;
	const game = await Backend.getGame(gameId);

	const examples = getExamples();
	const exampleGroups: Record<string, Example[]> = {};
	for (const example of examples) {
		const group = example.category;
		if (exampleGroups[group]) {
			exampleGroups[group].push(example);
			continue;
		}
		exampleGroups[group] = [example];
	}

	return {
		game,
		exampleGroups: Object.values(exampleGroups)
	};
};
