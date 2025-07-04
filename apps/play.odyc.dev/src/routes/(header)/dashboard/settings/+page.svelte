<script lang="ts">
	import Paint from '$lib/components/plaint/Paint.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	import { stores } from '$lib/stores.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Sprite from '$lib/components/plaint/Sprite.svelte';
	import { DefaultProfilePicture, Dependencies } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { invalidate } from '$app/navigation';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	let name = $state(stores.profile?.name ?? '');
	let sprite = $state(stores.profile?.avatarPixels ?? DefaultProfilePicture);

	let isLoading = $state(false);

	let showEditor = $state(false);
	function setShowEditor(value: boolean) {
		showEditor = value;
	}

	async function onSave(event: Event) {
		event.preventDefault();

		isLoading = true;

		try {
			await Backend.updateProfile(stores.profile?.$id ?? '', name, sprite);
			await invalidate(Dependencies.PROFILE);
			toast.success('Profile updated successfully.');
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	}

	let vimModeEnabled = $state(stores.user?.prefs?.vimModeEnabled ?? false);
	let isLoadingPrefs = $state(false);
	async function onPrefsSave(event: Event) {
		event.preventDefault();

		isLoadingPrefs = true;

		try {
			await Backend.updateVimModePrefs(vimModeEnabled);
			await invalidate(Dependencies.USER);
			toast.success('Preferences updated successfully.');
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoadingPrefs = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl p-3">
	<h1 class="font-title my-6 flex-shrink-0 text-3xl">Settings</h1>
	<div class="flex flex-col gap-6">
		<form onsubmit={onSave}>
			<Card.Root class="w-full">
				<Card.Header>
					<Card.Title>Profile settings</Card.Title>
					<Card.Description>Configure your public presence on Odyc.js Play</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-6">
						<div class="grid gap-2">
							<Label for="name">Name</Label>
							<Input id="name" type="text" bind:value={name} placeholder="Awesome gamer" required />
						</div>
						<div class="grid gap-2">
							<Label class="text-center">Profile picture</Label>
							<Card.Root class="w-[max-content] rounded-md">
								<Card.Content class="flex flex-col items-center gap-4">
									<Sprite class="aspect-square w-full max-w-40" {sprite} />

									<Button onclick={() => setShowEditor(true)} type="button" variant="outline"
										>Open editor</Button
									>
								</Card.Content>
							</Card.Root>
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="w-full flex-col items-end gap-2">
					<Button disabled={isLoading} type="submit">Save changes</Button>
				</Card.Footer>
			</Card.Root>
		</form>

		<form onsubmit={onPrefsSave}>
			<Card.Root class="w-full">
				<Card.Header>
					<Card.Title>Account preferences</Card.Title>
					<Card.Description>Configure settings for your Odyc Play account</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<Checkbox id="vim-mode" bind:checked={vimModeEnabled} />
							<div class="grid gap-2">
								<Label for="vim-mode">Enable Vim mode</Label>
								<p class="text-muted-foreground text-sm">
									Toggles support for Vim keybindings in code editor.
								</p>
							</div>
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="w-full flex-col items-end gap-2">
					<Button disabled={isLoadingPrefs} type="submit">Update</Button>
				</Card.Footer>
			</Card.Root>
		</form>
	</div>
</div>

<Dialog.Root open={showEditor} onOpenChange={setShowEditor}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="mb-2">
			<Dialog.Title>Profile picture editor</Dialog.Title>
			<Dialog.Description>Paint your own avatar.</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<Paint bind:sprite />
		<Dialog.Footer>
			<Button type="button" onclick={() => setShowEditor(false)}>Close editor</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
