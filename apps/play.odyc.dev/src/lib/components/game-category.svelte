<script lang="ts">
	import GameCardsStateful from './game-cards-stateful.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	const isDesktop = new MediaQuery('(min-width: 768px)');

	const perPage = 4;
	const siblingCount = $derived(isDesktop.current ? 1 : 0);

	const props = $props();

	const games: any[] = [];
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
		<h1 class="font-title flex-shrink-0 text-3xl">{props.title ?? 'Unnamed Category'}</h1>
		{#if Math.ceil(games.length / perPage) > 1}
			<Pagination.Root class="flex sm:justify-end" count={games.length} {perPage} {siblingCount}>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton>
								<ChevronLeftIcon class="size-4" />
							</Pagination.PrevButton>
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton>
								<ChevronRightIcon class="size-4" />
							</Pagination.NextButton>
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		{/if}
	</div>
	<div class="flex flex-col gap-4 md:gap-6">
		<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{#if (props.alwaysShowEmpty || games.length === 0) && props.emptyComponent}
				<props.emptyComponent></props.emptyComponent>
			{/if}

			{#each games.filter((_, index) => index < perPage) as game (game.$id)}
				<GameCardsStateful />
			{/each}
		</div>
	</div>
</div>
