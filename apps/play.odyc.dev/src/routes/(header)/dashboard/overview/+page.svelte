<script lang="ts">
	import GameCardsEmpty from '$lib/components/game-cards-empty.svelte';
	import GameCategory from '$lib/components/game-category.svelte';
	import GameCommunity from '$lib/components/game-community.svelte';
	import { stores } from '$lib/stores.svelte.js';

	let { data } = $props();
</script>

<div class="flex flex-1 flex-col">
	<div
		class="@container/main mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 pt-4 lg:px-6 lg:pt-6"
	>
		<GameCategory
			games={data.yourGames}
			queries={data.yourGamesQueries}
			allowCreate={true}
			title={stores.t('overview.yourGames')}
		>
			<GameCardsEmpty description={stores.t('overview.createFirstGame')}></GameCardsEmpty>
		</GameCategory>
		<GameCategory
			games={data.collaborationGames}
			queries={data.collaborationGamesQueries}
			title={stores.t('overview.collaborations')}
			allowCreate={false}
			><GameCardsEmpty description={stores.t('overview.noCollaboration')}></GameCardsEmpty>
		</GameCategory>
		<GameCommunity profiles={data.profiles} games={data.communityHighlights} />
	</div>
</div>
