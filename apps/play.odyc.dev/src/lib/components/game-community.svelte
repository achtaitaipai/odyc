<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import IconPlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import type { Models } from 'appwrite';
	import type { Games, Profiles } from '$lib/appwrite';
	import { stores } from '$lib/stores.svelte';

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
	<h1 class="font-title text-3xl">{stores.t('games.featured')}</h1>

	{#if games.documents.length === 0}
		<Card.Root class="flex h-full justify-center border-dashed bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">{stores.t('games.noFeatured')}</Card.Title>
				<Card.Description
					>{stores.t('games.noFeaturedDescription')}</Card.Description
				>
			</Card.Header>
		</Card.Root>
	{/if}

	{#each games.documents as game (game.$id)}
		<Card.Root class="flex h-full justify-center bg-transparent">
			<Card.Header>
				<Card.Title class="font-title text-2xl font-light">{game.name}</Card.Title>
				<Card.Description
					>{stores.t('games.developedBy')} <a href={`/profiles/${getOwner(game)?.$id}`} class="text-primary underline"
						>{getOwner(game)?.name}</a
					>
				</Card.Description>
				<Card.Action>
					<a href={`/g/${game.slug}`}>
						<Button class="" variant="outline"
							>{stores.t('games.playNow')}<IconPlayerPlayFilled class="text-muted-foreground" /></Button
						>
					</a>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{/each}
</div>
