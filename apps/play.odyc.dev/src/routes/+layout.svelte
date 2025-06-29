<script lang="ts">
	import { Backend } from '$lib/backend';
	import { stores } from '$lib/stores.svelte';
	import '../app.css';
	import { ModeWatcher, mode } from 'mode-watcher';

	let { children, data } = $props();

	let theme = data.theme as any; // Prevent issues with unsupported words

	async function storeTheme(mode: string) {
		await Backend.updateThemePrefferences(mode);
	}

	$effect(() => {
		if (mode.current && (stores.user?.prefs.theme ?? '') !== mode.current) {
			if (stores.user) {
				storeTheme(mode.current);
			}
		}
	});
</script>

<ModeWatcher defaultMode={theme} lightClassNames={[]} darkClassNames={['dark']} />

{@render children()}
