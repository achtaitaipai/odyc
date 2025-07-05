<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import html2canvas from 'html2canvas-pro';
	import { toggleMode } from 'mode-watcher';
	import IconCamera from '@lucide/svelte/icons/camera';
	import IconCheck from '@lucide/svelte/icons/check';
	import IconLoader from '@lucide/svelte/icons/loader-2';
	import { Backend } from '$lib/backend';
	import { goto, invalidate } from '$app/navigation';
	import { DefaultProfilePicture, Dependencies } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import { stores } from '$lib/stores.svelte';
	import Sprite from './plaint/Sprite.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const ctrlKey = isMac ? 'Cmd' : 'Ctrl';

	let isLoading = false;

	async function onLogout() {
		isLoading = true;
		try {
			await Backend.signOut();
			await invalidate(Dependencies.USER);
			goto('/');
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	}

	function onFeedbackCancel() {
		feedbackText = '';
		screenshotBlob = null;
		feedbackHasScreenshot = false;
		isScreenshotLoading = false;
		setIsFeedbackOpen(false);
	}

	let feedbackText = $state('');
	let isFeedbackLoading = $state(false);
	async function onFeedbackSubmit() {
		isFeedbackLoading = true;
		try {
			let fileId = '';
			if (screenshotBlob) {
				const file = await Backend.createFeedbackFile(screenshotBlob);
				fileId = file.$id;
			}

			await Backend.createFeedback(feedbackText, fileId);
			toast.success('Feedback submitted successfully.');
			setIsFeedbackOpen(false);
			feedbackText = '';
			screenshotBlob = null;
			feedbackHasScreenshot = false;
			isScreenshotLoading = false;
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isFeedbackLoading = false;
		}
	}

	let isFeedbackOpen = $state(false);
	function setIsFeedbackOpen(value: boolean) {
		isFeedbackOpen = value;
	}

	let feedbackHasScreenshot = $state(false);
	let isScreenshotLoading = $state(false);
	let screenshotBlob = $state<null | Blob>(null);
	function makeScreenshot() {
		isScreenshotLoading = true;
		html2canvas(document.body, {
			logging: false,
			ignoreElements: (element) => {
				return element.id === 'feedback-popover';
			}
		}).then(function (canvas) {
			canvas.toBlob((blob) => {
				screenshotBlob = blob;
				feedbackHasScreenshot = true;
				isScreenshotLoading = false;
			});
		});
	}

	function openCommands() {
		const ninja = document.querySelector('ninja-keys') as any;
		ninja.open();
	}
</script>

<header
	class="flex shrink-0 items-center gap-2 border-b py-3 transition-[width,height] ease-linear"
>
	<div class="mx-auto flex w-full max-w-7xl items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<a href="/" class="flex items-center gap-2">
			<img src="/logo.png" alt="Odyc.js Logo" class="pixelated h-5 w-5" />

			<h1 class="font-pixel text-2xl font-medium">Odyc.js</h1>
		</a>
		<div class="ml-auto flex items-center gap-2">
			<div id="feedback-popover" data-html2canvas-ignore>
				<Popover.Root bind:open={isFeedbackOpen}>
					<Popover.Trigger class={buttonVariants({ variant: 'ghost' })}>Feedback</Popover.Trigger>
					<Popover.Content class="w-[25rem]">
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="leading-none font-medium">Let's make Odyc.js better</h4>
								<p class="text-muted-foreground text-sm">
									Odyc.js evolves with community. Tell us how we can make Odyc.js better for you.
								</p>
							</div>
							<div class="grid gap-2">
								<div class="grid w-full gap-1.5">
									<Label for="support-message" class="text-sm">Tell us about your experience</Label>
									<Textarea
										bind:value={feedbackText}
										class="h-28"
										placeholder="Type your message here."
										id="support-message"
									/>
									<p class="text-muted-foreground text-xs font-light">
										Your can tell us about bug you faced, or feature you want to see.
									</p>
								</div>
							</div>

							<div class="flex items-center justify-between">
								{#if isScreenshotLoading}
									<div class="flex items-center gap-1">
										<Button disabled={true} variant="secondary" size="icon" class="size-8">
											<IconLoader class="animate-spin" />
										</Button>
									</div>
								{:else if !feedbackHasScreenshot}
									<div>
										<Button onclick={makeScreenshot} variant="secondary" size="icon" class="size-8">
											<IconCamera />
										</Button>
									</div>
								{:else}
									<div class="flex items-center gap-1">
										<Button disabled={true} variant="secondary" size="icon" class="size-8">
											<IconCheck />
										</Button>
										<p class="text-muted-foreground text-xs">Screenshot included</p>
									</div>
								{/if}

								<div>
									<Button variant="ghost" onclick={onFeedbackCancel}>Cancel</Button>
									<Button disabled={isFeedbackLoading} onclick={onFeedbackSubmit} variant="outline"
										>Submit</Button
									>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<button
				onclick={openCommands}
				class="bg-primary-foreground border-muted-background flex items-center gap-2 rounded-lg border px-2 py-1.5 pl-3"
			>
				<span class="text-muted-foreground text-sm font-light">Type a command...</span>
				<kbd
					class="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none"
				>
					<span class="text-xs">{ctrlKey}</span>K
				</kbd>
			</button>

			<Button onclick={toggleMode} variant="ghost" class="" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" class="size-7 translate-y-0.5 transform" size="icon">
						{#if stores.user}
							<Sprite
								class="!aspect-square !h-full !w-full"
								sprite={stores.profile?.avatarPixels ?? DefaultProfilePicture}
							/>
						{:else}
							<UserIcon class="size-[1.2rem]" />
						{/if}
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#if stores.user}
						<DropdownMenu.Group>
							<a href="/dashboard/profile"
								><DropdownMenu.Item class="">My Profile</DropdownMenu.Item></a
							>
							<a href="/dashboard/settings"
								><DropdownMenu.Item class="">Settings</DropdownMenu.Item></a
							>
							<DropdownMenu.Separator />
							<button disabled={isLoading} onclick={onLogout} class="w-full">
								<DropdownMenu.Item class="">Log out</DropdownMenu.Item>
							</button>
						</DropdownMenu.Group>
					{:else}
						<DropdownMenu.Group>
							<a href="/auth/sign-in"><DropdownMenu.Item class="">Sign In</DropdownMenu.Item></a>
						</DropdownMenu.Group>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
