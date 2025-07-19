<script lang="ts">
	import { PUBLIC_IFRAME_ENDPOINT } from '$env/static/public';
	import type { PageProps } from '../$types';
	import { stores } from '$lib/stores.svelte';
	import { DefaultCode } from '$lib/constants';
	import * as Card from '$lib/components/ui/card';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

	let descriptionChunks = game.description.split('\n');
	let howToPlayChunks = game.howToPlay.split('\n');

	if (descriptionChunks.length === 0) {
		descriptionChunks = ['No description available.'];
	}

	if (howToPlayChunks.length === 0) {
		howToPlayChunks = ['No instructions available.'];
	}

	let preview: HTMLCanvasElement | null = $state(null);

	window.addEventListener('message', function (event) {
		const { type, detail } = event.data;
		if (type === 'on-runner-ready') {
			sendCode();
		}
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
</script>

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

						<h1 class="font-title mt-6 mb-3 flex-shrink-0 text-3xl font-light">How to play</h1>
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
