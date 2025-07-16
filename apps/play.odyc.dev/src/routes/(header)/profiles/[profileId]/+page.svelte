<script lang="ts">
	import GameCardsEmpty from '$lib/components/game-cards-empty.svelte';
	import GameCategory from '$lib/components/game-category.svelte';
	import Sprite from '$lib/components/plaint/Sprite.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { DefaultProfilePicture } from '$lib/constants.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { stores } from '$lib/stores.svelte';

	const { data } = $props();

	let profile = $derived(data.profile);
	let games = $derived(data.games);
	let gamesQueries = $derived(data.gamesQueries);

	function dateToString(str: string) {
		const date = new Date(str);

		const formatted = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

		return formatted;
	}
</script>

<div class="mx-auto w-full max-w-7xl p-4 lg:p-6">
	<Breadcrumb.Root class="mb-3">
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/dashboard/overview">{stores.t('nav.home')}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page
					>{(profile.name ?? stores.t('profile.anonymous')) +
						stores.t('profile.userProfile')}</Breadcrumb.Page
				>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<Card.Root class="max-w-3xl">
		<Card.Content>
			<div class="flex flex-col gap-4 sm:flex-row">
				<div>
					<Sprite
						class="!aspect-square !w-[10rem] flex-shrink-0"
						sprite={profile.avatarPixels ?? DefaultProfilePicture}
					/>
				</div>
				<div>
					<h1 class="font-title flex-shrink-0 text-3xl font-light">
						{profile.name ?? stores.t('profile.anonymous')}
					</h1>
					<p class="text-muted-foreground mt-1 text-sm font-light">
						Joined {dateToString(profile.$createdAt)}
					</p>
					<p class="text-muted-foreground text-sm">
						<span class="text-primary mr-2 text-2xl">{games.total}</span>{games.total === 1
							? stores.t('profile.gameCreated')
							: stores.t('profile.gamesCreated')}
					</p>

					{#if profile.description}
						<div class="mt-3">
							<blockquote class="border-muted-foreground border-l-2 pl-2">
								{profile.description}
							</blockquote>
						</div>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="@container/main mx-auto mt-6 flex w-full max-w-7xl flex-1 flex-col gap-12">
		<GameCategory
			{games}
			queries={gamesQueries}
			title={(profile.name ?? stores.t('profile.anonymous')) + stores.t('profile.userGames')}
			allowCreate={false}
			><GameCardsEmpty description={stores.t('profile.noGamesYet')}></GameCardsEmpty>
		</GameCategory>
	</div>
</div>
