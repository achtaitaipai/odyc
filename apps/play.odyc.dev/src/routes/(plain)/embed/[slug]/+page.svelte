<script lang="ts">
	import { PUBLIC_IFRAME_ENDPOINT } from '$env/static/public';
	import type { PageProps } from './$types';
	import { stores } from '$lib/stores.svelte';
	import { DefaultCode } from '$lib/constants';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

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

<div class="fixed inset-0">
	<iframe
		class="h-full w-full"
		id="preview"
		src={(PUBLIC_IFRAME_ENDPOINT ?? '/iframe') + '?version=' + game.version}
		title={stores.t('editor.gamePreview')}
	></iframe>
</div>
