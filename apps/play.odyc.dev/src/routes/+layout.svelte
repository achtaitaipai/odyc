<script lang="ts">
	import '../app.css';
	import '../editor.css';
	import 'codemirror-theme-vars/base.css';

	import { NinjaKeys } from 'ninja-keys';
	import { Backend } from '$lib/backend';
	import { stores } from '$lib/stores.svelte';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { children, data } = $props();

	let theme = data.theme as any; // Prevent issues with unsupported words
	let games = data.games as any; // Prevent issues with unsupported words

	async function storeTheme(mode: string) {
		await Backend.updateThemePrefs(mode);
	}

	$effect(() => {
		if (mode.current && (stores.user?.prefs.theme ?? '') !== mode.current) {
			if (stores.user) {
				storeTheme(mode.current);
			}
		}
	});

	const hotkeys = [
		{
			id: 'home',
			title: 'Dashboard',
			hotkey: 'cmd+d',
			mdIcon: 'apps',
			handler: () => {
				goto('/dashboard');
			}
		},
		{
			id: 'my-profile',
			title: 'My profile',
			hotkey: 'cmd+p',
			mdIcon: 'person',
			handler: () => {
				goto('/dashboard/profile');
			}
		},
		{
			id: 'settings',
			title: 'Settings',
			hotkey: 'cmd+e',
			mdIcon: 'settings',
			handler: () => {
				goto('/dashboard/settings');
			}
		}
	];

	if (games.total > 0) {
		hotkeys.push({
			id: 'open-game',
			title: 'Open game in editor ...',
			hotkey: 'cmd+g',
			mdIcon: 'gamepad',
			children: games.documents.map((game) => {
				return {
					id: game.$id,
					title: game.name,
					mdIcon: 'gamepad',
					keyword: game.slug,
					handler: () => {
						goto('/dashboard/games/' + game.$id);
					}
				};
			})
		});
	}

	console.log(hotkeys);

	onMount(async () => {
		const ninja = document.querySelector('ninja-keys') as any;
		ninja.data = hotkeys;
	});
</script>

<ModeWatcher defaultMode={theme} lightClassNames={[]} darkClassNames={['dark']} />
<Toaster position="top-center" />

{@render children()}

<ninja-keys class={theme} placeholder="Type a command..."></ninja-keys>
