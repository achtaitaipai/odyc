<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import IconPlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import IconBolt from '@tabler/icons-svelte/icons/bolt';
	import Badge from './ui/badge/badge.svelte';
	import type { Models } from 'appwrite';
	import type { Games, Profiles } from '$lib/appwrite';

	const {
		games,
		profiles
	}: {
		games: Models.DocumentList<Games>;
		profiles: Models.DocumentList<Profiles>;
	} = $props();

	function getOwner(game: Games): Profiles | undefined {
		const profileId = game.ownerProfileId;
		const profile = profiles.documents.find((profile) => profile.$id === profileId);
		return profile;
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-title text-3xl">Featured Games</h1>

	{#if games.documents.length === 0}
		<Card.Root class="flex h-full justify-center border-dashed bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">No games are featured</Card.Title>
				<Card.Description
					>We manually feature games we consider enjoyable to play. Stay tuned for first games!</Card.Description
				>
			</Card.Header>
		</Card.Root>
	{/if}

	{#each games.documents as game (game.$id)}
		<Card.Root class="flex h-full justify-center bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">{game.name}</Card.Title>
				<Card.Description
					>Developed by <a href={`/profiles/${getOwner(game)?.$id}`} class="text-primary underline"
						>{getOwner(game)?.name}</a
					>
				</Card.Description>
				{#if game.tags}
					<div class="mt-3">
						{#each game.tags as tag (tag)}
							<Badge class="text-base" variant="outline">
								<IconBolt class="text-muted-foreground !h-4 !w-4" />{tag}</Badge
							>
						{/each}
					</div>
				{/if}
				<Card.Action>
					<a href={`/g/${game.slug}`}>
						<Button class="" variant="outline"
							>Play now<IconPlayerPlayFilled class="text-muted-foreground" /></Button
						>
					</a>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{/each}
</div>
