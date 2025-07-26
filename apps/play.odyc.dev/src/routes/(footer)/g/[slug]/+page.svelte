<script lang="ts">
	import { PUBLIC_IFRAME_ENDPOINT } from '$env/static/public';
	import type { PageProps } from './$types';
	import { stores } from '$lib/stores.svelte';
	import { DefaultCode } from '$lib/constants';
	import * as Card from '$lib/components/ui/card';
	import CloneIcon from '@lucide/svelte/icons/git-fork';
	import FullscreenIcon from '@lucide/svelte/icons/maximize';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

	let descriptionChunks = $derived(game?.description?.split('\n') ?? ['No description available.']);
	let howToPlayChunks = $derived(game?.howToPlay?.split('\n') ?? ['No instructions available.']);

	let preview: HTMLCanvasElement | null = $state(null);

	onMount(() => {
		window.addEventListener('message', function (event) {
			const { type, detail } = event.data;
			if (type === 'on-runner-ready') {
				sendCode();
			}
		});
	});

	function sendCode() {
		preview = document.getElementById('preview') as HTMLCanvasElement;

		if (preview) {
			console.log(game.version);
			console.log(typeof game.code);
			// @ts-expect-error It exists, not sure why types dont see it
			const contentWindow = preview?.contentWindow;
			contentWindow?.postMessage(
				{
					type: 'oncodechange',
					detail: {
						code: game.code ? game.code : DefaultCode
					}
				},
				'*'
			);
		}
	}

	function onFullscreen() {
		const preview = document.getElementById('preview') as HTMLCanvasElement;
		preview?.requestFullscreen();
	}

	let isCloning = $state(false);
	async function onClone() {
		isCloning = true;

		try {
			const newGame = await Backend.cloneGame(game);
			goto(`/dashboard/games/${newGame.$id}`);
			toast.success('Game cloned successfully.');
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isCloning = false;
		}
	}
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>{game.name} | Odyc.js Play</title>
	<meta
		name="description"
		content={game.description?.split('\n').join(' ') ?? 'Odyc.js Play game without description.'}
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content={`https://odyc-play.appwrite.network/g/${game.slug}`} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={`${game.name} | Odyc.js Play`} />
	<meta
		property="og:description"
		content={game.description?.split('\n').join(' ') ?? 'Odyc.js Play game without description.'}
	/>
	<meta
		property="og:image"
		content={`https://688487d9000eea37e1fe.fra.appwrite.run/v1/og-images/games/${game.$id}`}
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="odyc-play.appwrite.network" />
	<meta property="twitter:url" content={`https://odyc-play.appwrite.network/g/${game.slug}`} />
	<meta name="twitter:title" content={`${game.name} | Odyc.js Play`} />
	<meta
		name="twitter:description"
		content={game.description?.split('\n').join(' ') ?? 'Odyc.js Play game without description.'}
	/>
	<meta
		name="twitter:image"
		content={`https://688487d9000eea37e1fe.fra.appwrite.run/v1/og-images/games/${game.$id}`}
	/>

	<!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

<div class="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10 md:pt-6">
	<div class="h-full w-full max-w-7xl">
		<Breadcrumb.Root class="mb-6">
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/dashboard/overview">Odyc.js</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{game.name}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>

		<div class="mb-3 grid h-full w-full grid-cols-6 gap-6 sm:grid-cols-12">
			<div class="col-span-6 w-full">
				<Card.Root class="sticky top-4 col-span-12 p-0 md:col-span-6">
					<Card.Content class="aspect-square w-full p-2">
						<iframe
							class="h-full w-full"
							id="preview"
							src={(PUBLIC_IFRAME_ENDPOINT ?? '/iframe') + '?version=' + game.version}
							title={stores.t('editor.gamePreview')}
						></iframe>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="col-span-6 h-full w-full">
				<div class="mb-4 flex flex-col gap-3 md:flex-row">
					<Button variant="outline" type="button" onclick={onFullscreen}>
						<FullscreenIcon />
						{stores.t('publicUrl.fullscreen')}</Button
					>

					{#if stores.user}
						<Button variant="outline" type="button" disabled={isCloning} onclick={onClone}>
							<CloneIcon />
							{stores.t('publicUrl.fork')}</Button
						>
					{:else}
						<a href="/auth/sign-in">
							<Button variant="outline" type="button">
								<CloneIcon />
								{stores.t('publicUrl.fork')}</Button
							>
						</a>
					{/if}
				</div>

				<Card.Root class="col-span-12 p-0 md:col-span-6">
					<Card.Content class="h-full p-4">
						<h1 class="font-title mb-3 flex-shrink-0 text-3xl">{game.name}</h1>

						{#each descriptionChunks as chunk}
							{#if !chunk}
								<div class="h-4"></div>
							{:else}
								<p class="text-muted-foreground">{chunk}</p>
							{/if}
						{/each}

						<h1 class="font-title mt-6 mb-3 flex-shrink-0 text-3xl font-light">
							{stores.t('publicUrl.howToPlay')}
						</h1>
						{#each howToPlayChunks as chunk}
							{#if !chunk}
								<div class="h-4"></div>
							{:else}
								<p class="text-muted-foreground">{chunk}</p>
							{/if}
						{/each}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>
