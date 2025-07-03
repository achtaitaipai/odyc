<script lang="ts">
	import GameCardsStateful from './game-cards-stateful.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Query, type Models } from 'appwrite';
	import type { Games } from '$lib/appwrite';
	import Button from './ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { goto } from '$app/navigation';

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

	let gameName = $state('');
	let isLoading = $state(false);

	async function onPageChange(page: number) {
		games = await Backend.listGames([...props.queries, Query.offset(perPage * (page - 1))]);
	}

	async function onCreateGame(event: Event) {
		event.preventDefault();
		isLoading = true;
		try {
			const game = await Backend.createGame(gameName);
			goto('/dashboard/games/' + game.$id);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
		<h1 class="font-title flex-shrink-0 text-3xl">{props.title ?? 'Unnamed Category'}</h1>

		{#if props.allowCreate}
			<Dialog.Root>
				<Dialog.Trigger>
					<Button type="button">Create game</Button>
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<form onsubmit={onCreateGame}>
						<Dialog.Header class="mb-2">
							<Dialog.Title>Create new game</Dialog.Title>
							<Dialog.Description>A beginning of something amazing.</Dialog.Description>
						</Dialog.Header>

						<Separator />

						<div class="grid gap-4 py-4">
							<div class="flex w-full max-w-sm flex-col gap-1.5">
								<Label for="game-name">Game name</Label>
								<Input
									required={true}
									bind:value={gameName}
									type="text"
									id="game-name"
									placeholder="Awesome game"
								/>
							</div>
						</div>
						<Dialog.Footer>
							<Button disabled={isLoading} type="submit">Create</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>
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
