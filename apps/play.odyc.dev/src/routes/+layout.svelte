<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import AlertAnonymous from '$lib/components/alert-anonymous.svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SiteHeader from '$lib/components/site-header.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" lightClassNames={[]} darkClassNames={['dark']} />

<Sidebar.Provider
	class="pb-12"
	style="--sidebar-width: 0px; --header-height: calc(var(--spacing) * 12);"
>
	<Sidebar.Inset>
		<header>
			<div class="mx-auto w-full max-w-7xl p-3">
				<AlertAnonymous />
			</div>

			<SiteHeader />
		</header>

		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<footer class="bg-primary-foreground pb-4">
	<Separator />
	<div
		class="i mx-auto mt-4 flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-lg sm:flex-row"
	>
		<p class="font font-light">
			Made with <span class="text-base">🩵</span> and
			<a href="https://appwrite.io/" target="_blank"
				><img alt="Appwrite logo" src="/appwrite.svg" class="inline size-5" /></a
			>
		</p>
		<p class="text-muted-foreground text-sm font-light">Copyright © 2025 Odyc.js</p>
	</div>
</footer>
