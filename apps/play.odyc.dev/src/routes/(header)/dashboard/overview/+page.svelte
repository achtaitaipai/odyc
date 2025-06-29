<script lang="ts">
	import GameCardsNew from '$lib/components/game-cards-new.svelte';
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
			games={data.data.yourGames}
			profiles={data.data.profiles}
			queries={data.yourGamesQueries}
			alwaysShowEmpty={true}
			emptyComponent={GameCardsNew}
			title="Your Games"
		/>
		<GameCategory
			games={data.data.collaborationGames}
			profiles={data.data.profiles}
			queries={data.collaborationGamesQueries}
			emptyComponent={GameCardsEmpty}
			title="Your Collaborations"
		/>
		<GameCommunity games={data.communityHighlights} />
	</div>
</div>
