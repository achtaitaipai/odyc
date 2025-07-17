<script lang="ts">
	import type { Games } from '$lib/appwrite';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import IconDotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import { Backend } from '$lib/backend';
	import Button from './ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import { Dependencies } from '$lib/constants';
	import { stores } from '$lib/stores.svelte';
	import { useDurationFrom } from '$lib/duration';
	import { defaultLocale } from '$lib/i18n';

	const {
		game
	}: {
		game: Games;
	} = $props();

	let durationFrom = $derived(useDurationFrom(stores.user?.prefs?.selectedLocale ?? defaultLocale));

	function getPreview(fileId: string) {
		if (!fileId) {
			return undefined;
		}

		if (fileId.startsWith('/')) {
			return fileId;
		}

		return Backend.getSceenshotPreview(fileId);
	}

	let isDeletionOpen = $state(false);
	function setDeletionOpen(value: boolean) {
		isDeletionOpen = value;
	}

	let isShiftPressed = $state(false);
	function handleKeyDown(event: any) {
		isShiftPressed = event.shiftKey;
	}
	function handleKeyUp(event: any) {
		isShiftPressed = event.shiftKey; // Will be false when shift is released
	}

	function onDeleteButton() {
		if (isShiftPressed) {
			onDelete();
		} else {
			setDeletionOpen(true);
		}
	}

	let isDeleting = $state(false);
	async function onDelete() {
		if (isDeleting) return;

		isDeleting = true;
		try {
			await Backend.deleteGame(game.$id);
			toast.success(stores.t('editor.gameDeletedSuccess'));
			await goto('/dashboard/overview');
			await invalidate(Dependencies.GAMES);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<a href={`/dashboard/games/${game.$id}`}>
	<Card.Root class="flex  justify-center overflow-hidden p-0">
		<Card.Header class="p-0">
			<img
				alt={`Light Screenshot of ${game.name}`}
				src={getPreview(game.thumbnailFileId ?? '') ?? '/placeholder-light.svg'}
				class="block aspect-video w-full object-cover object-center dark:hidden"
			/>
			<img
				alt={`Dark Screenshot of ${game.name}`}
				src={getPreview(game.thumbnailFileId ?? '') ?? '/placeholder-dark.svg'}
				class="hidden aspect-video w-full object-cover object-center dark:block"
			/>

			<div class="px-3 pt-1">
				<Card.Title class="flex items-center justify-between gap-2">
					<span class="font-title w-full text-lg font-light">{game.name}</span>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button class="size-8 flex-shrink-0" {...props} variant="ghost">
									<IconDotsVertical />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="start">
							<DropdownMenu.Group>
								<DropdownMenu.Item
									><a href={`/dashboard/games/${game.$id}`}>{stores.t('games.openInEditor')}</a
									></DropdownMenu.Item
								>

								<DropdownMenu.Item onclick={onDeleteButton} variant="destructive">
									{isShiftPressed ? stores.t('games.deleteInstantly') : stores.t('games.delete')}

									<DropdownMenu.Shortcut>⇧</DropdownMenu.Shortcut>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Card.Title>

				<Card.Description class="mb-2.5 text-xs"
					>{stores.t('ui.lastModified')}
					{durationFrom(game.$createdAt)}</Card.Description
				>
			</div>
		</Card.Header>
	</Card.Root>
</a>

<AlertDialog.Root open={isDeletionOpen} onOpenChange={(open) => setDeletionOpen(open)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{stores.t('games.deleteConfirm')}</AlertDialog.Title>
			<AlertDialog.Description>
				{stores.t('games.deleteDescription')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{stores.t('games.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={onDelete} disabled={isDeleting}
				>{stores.t('games.continue')}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
