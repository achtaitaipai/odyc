<script lang="ts">
	import GameCardsEmpty from '$lib/components/game-cards-empty.svelte';
	import GameCategory from '$lib/components/game-category.svelte';
	import GameCommunity from '$lib/components/game-community.svelte';

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
			title="Your Games"
		>
			<GameCardsEmpty description="Create your first game!"></GameCardsEmpty>
		</GameCategory>
		<GameCategory
			games={data.collaborationGames}
			queries={data.collaborationGamesQueries}
			title="Your Collaborations"
			allowCreate={false}
			><GameCardsEmpty description="You have not yet collaborated on someone else's game."
			></GameCardsEmpty>
		</GameCategory>
		<GameCommunity profiles={data.profiles} games={data.communityHighlights} />
	</div>
</div>
