<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import IconPlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import IconBolt from '@tabler/icons-svelte/icons/bolt';
	import Badge from './ui/badge/badge.svelte';

	const { games } = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-title text-3xl">Community Highlights</h1>

	{#if games.documents.length === 0}
		<Card.Root class="flex h-full justify-center border-dashed bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">No games are highlighted</Card.Title>
				<Card.Description>Make and publish a game, and it might be added here!</Card.Description>
			</Card.Header>
		</Card.Root>
	{/if}

	{#each games as game (game.$id)}
		<Card.Root class="flex h-full justify-center bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">{game.title}</Card.Title>
				<Card.Description
					>Developed by <a href="#" class="text-primary underline">NAME&LINK TODO</a>
				</Card.Description>
				{#if game.tags}
					<div class="mt-3">
						{#each game.tags as tag (tag)}
							<Badge class="text-base" variant="outline">
								<IconBolt class="text-muted-foreground !h-4 !w-4" />ICON TODO {tag}</Badge
							>
						{/each}
					</div>
				{/if}
				<Card.Action>
					<Button class="cursor-pointer" variant="outline"
						>Play now ACTION TODO<IconPlayerPlayFilled class="text-muted-foreground" /></Button
					>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{/each}
</div>
