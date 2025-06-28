<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SiteHeader from '$lib/components/site-header.svelte';
	import GameCardsNew from '$lib/components/game-cards-new.svelte';
	import GameCardsEmpty from '$lib/components/game-cards-empty.svelte';
	import AlertAnonymous from '$lib/components/alert-anonymous.svelte';
</script>

<div class="p-3 mx-auto w-full max-w-7xl">
    <AlertAnonymous />
</div>

<Sidebar.Provider style="--sidebar-width: 0px; --header-height: calc(var(--spacing) * 12);">
	<Sidebar.Inset>
		<SiteHeader />
		<div class="flex flex-1 flex-col">
			<div
				class="@container/main mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2 px-4 pt-4 lg:px-6 lg:pt-6"
			>
				<h1 class="font-title text-3xl">Your Games</h1>
				<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
					    <GameCardsNew />
					</div>
				</div>
				
					<h1 class="font-title text-3xl">Your Collaborations</h1>
					
					<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
						    <GameCardsEmpty />
						</div>
					</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
