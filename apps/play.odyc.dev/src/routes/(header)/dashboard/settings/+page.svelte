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
	import * as Select from '$lib/components/ui/select/index.js';
	import { defaultLocale, languages, locales, type Locale } from '$lib/i18n';

	let originalName = $state(stores.profile?.name ?? '');
	let originalSprite = $state(stores.profile?.avatarPixels);
	let originalDescription = $state(stores.profile?.description ?? '');

	let name = $state(stores.profile?.name ?? '');
	let description = $state(stores.profile?.description ?? '');
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
			await Backend.updateProfile(stores.profile?.$id ?? '', name, sprite, description);
			await invalidate(Dependencies.PROFILE);
			toast.success(stores.t('notifications.profileUpdated'));
			originalName = name;
			originalSprite = sprite;
			originalDescription = description;
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	}

	let originalVimModeEnabled = $state(stores.user?.prefs?.vimModeEnabled);
	let vimModeEnabled = $state(stores.user?.prefs?.vimModeEnabled ?? false);
	let originalSelectedLocale = $state(stores.user?.prefs.selectedLocale);
	let selectedLocale: Locale = $state(stores.user?.prefs?.selectedLocale ?? defaultLocale);
	let isLoadingPrefs = $state(false);

	async function onPrefsSave(event: Event) {
		event.preventDefault();

		isLoadingPrefs = true;

		try {
			await Backend.updateVimModePrefs(vimModeEnabled);
			await Backend.updateSelectedLocalePrefs(selectedLocale);
			await invalidate(Dependencies.USER);
			toast.success(stores.t('notifications.preferencesUpdated'));
			originalVimModeEnabled = vimModeEnabled;
			originalSelectedLocale = selectedLocale;
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoadingPrefs = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl p-3">
	<h1 class="font-title my-6 flex-shrink-0 text-3xl">{stores.t('settings')}</h1>
	<div class="flex flex-col gap-6">
		<form onsubmit={onSave}>
			<Card.Root class="w-full">
				<Card.Header>
					<Card.Title>{stores.t('profile.settings')}</Card.Title>
					<Card.Description>{stores.t('profile.settingsDescription')}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-6">
						<div class="grid gap-2">
							<Label for="name">{stores.t('profile.name')}</Label>
							<Input
								id="name"
								type="text"
								bind:value={name}
								placeholder={stores.t('profile.placeholder.name')}
								required
							/>
						</div>
						<div class="grid gap-2">
							<Label for="description">{stores.t('profile.description')}</Label>
							<Input
								id="description"
								type="text"
								bind:value={description}
								placeholder="I love making ..."
								required
							/>
						</div>
						<div class="grid gap-2">
							<Label class="text-center">{stores.t('profile.picture')}</Label>
							<Card.Root class="w-[max-content] rounded-md">
								<Card.Content class="flex flex-col items-center gap-4">
									<Sprite class="aspect-square w-full max-w-40" {sprite} />

									<Button onclick={() => setShowEditor(true)} type="button" variant="outline"
										>{stores.t('profile.openEditor')}</Button
									>
								</Card.Content>
							</Card.Root>
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="w-full flex-col items-end gap-2">
					<Button
						disabled={isLoading ||
							(name === originalName &&
								sprite === originalSprite &&
								description === originalDescription)}
						type="submit">{stores.t('profile.updateProfile')}</Button
					>
				</Card.Footer>
			</Card.Root>
		</form>

		<form onsubmit={onPrefsSave}>
			<Card.Root class="w-full">
				<Card.Header>
					<Card.Title>{stores.t('profile.accountPreferences')}</Card.Title>
					<Card.Description>{stores.t('profile.accountPreferencesDescription')}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-6">
						<div class="flex flex-col gap-6">
							<div class="grid gap-2">
								<Label>{stores.t('profile.preferredLanguage')}</Label>
								<Select.Root type="single" name="locale" bind:value={selectedLocale}>
									<Select.Trigger class="w-[180px]">{languages[selectedLocale]}</Select.Trigger>
									<Select.Content>
										{#each locales as locale}
											<Select.Item value={locale} label={languages[locale]} />
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</div>

						<div class="flex flex-col gap-6">
							<div class="flex items-start gap-3">
								<Checkbox id="vim-mode" bind:checked={vimModeEnabled} />
								<div class="grid gap-2">
									<Label for="vim-mode">{stores.t('profile.enableVim')}</Label>
									<p class="text-muted-foreground text-sm">
										{stores.t('profile.enableVimDescription')}
									</p>
								</div>
							</div>
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="w-full flex-col items-end gap-2">
					<Button
						disabled={isLoadingPrefs ||
							(vimModeEnabled === originalVimModeEnabled &&
								selectedLocale === originalSelectedLocale)}
						type="submit">{stores.t('profile.updatePreferences')}</Button
					>
				</Card.Footer>
			</Card.Root>
		</form>
	</div>
</div>

<Dialog.Root open={showEditor} onOpenChange={setShowEditor}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="mb-2">
			<Dialog.Title>{stores.t('profile.pictureEditor')}</Dialog.Title>
			<Dialog.Description>{stores.t('profile.pictureEditorDescription')}</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<Paint bind:sprite />
		<Dialog.Footer>
			<Button type="button" onclick={() => setShowEditor(false)}
				>{stores.t('profile.closeEditor')}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
