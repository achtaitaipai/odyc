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
		if (!open) {
			setTimeout(() => {
				commandInput = '';
				inOpenGameSubMenu = false;
			}, 300);
		}
	});

	$effect(() => {
		if (open)
			gamesPromise = Backend.listGames([
				Query.limit(50),
				Query.select(['$id', 'name']),
				Query.equal('ownerProfileId', stores.profile?.$id ?? ''),
				Query.orderDesc('$updatedAt'),
				Query.orderDesc('$createdAt')
			]);
	});

	afterNavigate(() => {
		open = false;
		inOpenGameSubMenu = false;
	});

	let commandInput = $state('');

	function onOpenGame() {
		inOpenGameSubMenu = true;
		commandInput = '';
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input bind:value={commandInput} placeholder={stores.t('commands.placeholder')} />
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
				{#await gamesPromise}
					<Command.Item disabled={true}>
						<GamepadIcon class="mr-2 size-4" />
						<span>{stores.t('commands.openGame')}</span>
					</Command.Item>
				{:then games}
					{#if games && games.documents.length}
						<Command.Item onSelect={onOpenGame}>
							<GamepadIcon class="mr-2 size-4" />
							<span>{stores.t('commands.openGame')}</span>
							<!-- <Command.Shortcut>⌘S</Command.Shortcut> -->
						</Command.Item>
					{/if}
				{/await}
			</Command.Group>
		{:else}
			<Command.Group>
				{#await gamesPromise then games}
					{#each games?.documents ?? [] as game}
						<Command.LinkItem href="/dashboard/games/{game.$id}">
							<GamepadIcon class="mr-2 size-4" />
							<span>{game.name}</span>
						</Command.LinkItem>
					{/each}
				{/await}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
