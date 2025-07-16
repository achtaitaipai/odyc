<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Games } from '$lib/appwrite';
	import { Backend } from '$lib/backend';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { generateGametName } from '$lib/generateGameName';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { Query, type Models } from 'appwrite';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';
	import GameCardsStateful from './game-cards-stateful.svelte';
	import Button from './ui/button/button.svelte';
	import { stores } from '$lib/stores.svelte';

	const isDesktop = new MediaQuery('(min-width: 768px)');

	const perPage = 4;
	const siblingCount = $derived(isDesktop.current ? 1 : 0);

	type Props = {
		title: string;
		games: Models.DocumentList<Games>;
		allowCreate: boolean;
		queries: string[];
		children: any;
	};

	const props: Props = $props();

	let games = $derived(props.games);

	let isLoading = $state(false);

	async function onPageChange(page: number) {
		games = await Backend.listGames([...props.queries, Query.offset(perPage * (page - 1))]);
	}

	async function createGame() {
		isLoading = true;
		try {
			const game = await Backend.createGame(generateGametName());
			isLoading = false;
			goto('/dashboard/games/' + game.$id);
			toast.success('Game successfully created!');
		} catch (error: any) {
			toast.error(error.message);
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
		<h1 class="font-title flex-shrink-0 text-3xl">{props.title ?? 'Unnamed Category'}</h1>

		{#if props.allowCreate}
			<Button type="button" disabled={isLoading} onclick={createGame}>
				{#if isLoading}
					<Loader2Icon class="animate-spin" />
				{/if}
				{stores.t('games.create')}</Button
			>
		{/if}
	</div>
	<div class="flex flex-col gap-4 md:gap-6">
		<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{#if games.total === 0 && props.children}
				{@render props.children()}
			{/if}

			{#each games.documents as game (game.$id)}
				<GameCardsStateful {game} />
			{/each}
		</div>
	</div>
	{#if Math.ceil(games.total / perPage) > 1}
		<Pagination.Root
			{onPageChange}
			class="flex sm:justify-end"
			count={games.total}
			{perPage}
			{siblingCount}
		>
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
