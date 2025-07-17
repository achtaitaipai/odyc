<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import GamepadIcon from '@lucide/svelte/icons/gamepad';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Command from '$lib/components/ui/command/index.js';
	import { stores } from '$lib/stores.svelte';
	import { afterNavigate } from '$app/navigation';
	import { Query, type Models } from 'appwrite';
	import type { Games } from '$lib/appwrite';
	import { Backend } from '$lib/backend';

	let { open = $bindable() }: { open: boolean } = $props();
	let inOpenGameSubMenu = $state(false);

	let gamesPromise = $state<Promise<Models.DocumentList<Games>>>();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	$effect(() => {
		if (!open && inOpenGameSubMenu) {
			inOpenGameSubMenu = false;
		}
	});

	$effect(() => {
		if (open) gamesPromise = Backend.listGames([Query.limit(50), Query.select(['$id', 'name'])]);
	});

	afterNavigate(() => {
		open = false;
		inOpenGameSubMenu = false;
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input placeholder={stores.t('commands.placeholder')} />
	<Command.List>
		<Command.Empty>{stores.t('commands.noResult')}</Command.Empty>
		{#if !inOpenGameSubMenu}
			<Command.Group>
				<Command.LinkItem href="/dashboard">
					<LayoutDashboardIcon class="mr-2 size-4" />
					<span>{stores.t('nav.dashboard')}</span>
				</Command.LinkItem>
				<Command.LinkItem href="/dashboard/profile">
					<UserIcon class="mr-2 size-4" />
					<span>{stores.t('nav.myProfile')}</span>
				</Command.LinkItem>
				<Command.LinkItem href="/dashboard/settings">
					<SettingsIcon class="mr-2 size-4" />
					<span>{stores.t('nav.settings')}</span>
				</Command.LinkItem>
				{#await gamesPromise then games}
					{#if games && games.documents.length}
						<Command.Item onSelect={() => (inOpenGameSubMenu = true)}>
							<GamepadIcon class="mr-2 size-4" />
							<span>{stores.t('commands.openGame')}</span>
							<!-- <Command.Shortcut>⌘S</Command.Shortcut> -->
						</Command.Item>
					{/if}
				{/await}
			</Command.Group>
		{:else}
			{#await gamesPromise then games}
				{#each games?.documents ?? [] as game}
					<Command.LinkItem href="/dashboard/games/{game.$id}">
						<GamepadIcon class="mr-2 size-4" />
						<span>{game.name}</span>
					</Command.LinkItem>
				{/each}
			{/await}
		{/if}
	</Command.List>
</Command.Dialog>
