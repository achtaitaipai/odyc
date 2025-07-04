<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { onMount, tick } from 'svelte';
	import OdycVersions from '$lib/versions.json';
	import type { PageProps } from './$types';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import * as Card from '$lib/components/ui/card';
	import { DefaultCode, Dependencies } from '$lib/constants';
	import { mode } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { beforeNavigate, goto, invalidate } from '$app/navigation';
	import slugify from 'slugify';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Editor from '$lib/components/editor/Editor.svelte';
	import { stores } from '$lib/stores.svelte';
	import { PUBLIC_IFRAME_ENDPOINT, PUBLIC_ODYC_VERSION } from '$env/static/public';
	import Paint from '$lib/components/plaint/Paint.svelte';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

	const initialCode = game.code ? game.code : DefaultCode;
	let code = $state(initialCode);
	let editor: Editor;

	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const ctrlKey = isMac ? 'Cmd' : 'Ctrl';

	function onEditorChange() {
		// Nothing needed yet, code itself is 2-way-binded
	}

	let preview: HTMLCanvasElement | null = $state(null);

	let isRecording = $state(false);
	let hasChangedCode = $state(false);

	window.addEventListener('message', function (event) {
		const { type, detail } = event.data;
		if (type === 'on-runner-ready') {
			updateCode();
		} else if (type === 'on-canvas-blob') {
			const { blob } = detail;
			onSaveCodeFinish(blob);
		}
	});

	async function getGameBlob() {
		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'onblobstart'
			},
			'*'
		);
	}

	$effect(() => {
		if (mode && mode.current) {
			updateTheme();
		}
	});

	$effect(() => {
		if (code) {
			updateCode();
		}
	});

	function updateTheme() {
		// TODO: Implement
	}

	beforeNavigate(({ cancel }) => {
		if (hasChangedCode) {
			if (
				!confirm(
					'Are you sure you want to leave this page? You have unsaved changes that will be lost.'
				)
			) {
				cancel();
			}
		}
	});

	// Hover on each property to see its docs!
	onMount(() => {
		preview = document.getElementById('preview') as HTMLCanvasElement;
		if (preview) {
			// @ts-expect-error It exists, not sure why types dont see it
			const contentWindow = preview?.contentWindow;

			contentWindow.console.log = (...args: any) => {
				console.log(...args);
			};
			contentWindow.console.error = (...args: any) => {
				console.error(...args);
			};
			contentWindow.console.warn = (...args: any) => {
				console.warn(...args);
			};
			contentWindow.console.info = (...args: any) => {
				console.info(...args);
			};
			contentWindow.console.debug = (...args: any) => {
				console.debug(...args);
			};
			contentWindow.console.trace = (...args: any) => {
				console.trace(...args);
			};
		}

		document.addEventListener('keydown', (event) => {
			const isCtrl = event.metaKey || event.ctrlKey;
			const isShift = event.shiftKey;
			if (isShift) {
				if (isCtrl && event.code === 'KeyF') {
					event.preventDefault();
					event.stopPropagation();
					onFormat();
					return;
				} else if (isCtrl && event.code === 'KeyS') {
					event.preventDefault();
					event.stopPropagation();
					setShowSaveAsDialog(true);
					return;
				} else if (isCtrl && event.code === 'KeyD') {
					event.preventDefault();
					event.stopPropagation();
					onDownload();
					return;
				}
			}

			if (isCtrl && event.code === 'KeyS') {
				event.preventDefault();
				event.stopPropagation();
				onSaveCodeStart();
				return;
			}
		});
	});

	function updateCode() {
		hasChangedCode = code !== initialCode;

		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'oncodechange',
				detail: {
					code
				}
			},
			'*'
		);
	}

	function onScreenshot() {
		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'onscreenshot',
				detail: {}
			},
			'*'
		);
	}

	function stopRecording() {
		isRecording = false;
		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'onrecordingend',
				detail: {}
			},
			'*'
		);
	}

	function startRecording() {
		isRecording = true;
		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'onrecordingstart',
				detail: {}
			},
			'*'
		);
	}

	function onFullscreen() {
		preview?.requestFullscreen();
	}

	function onDownload() {
		const fileName = slugify(game.name).toLowerCase() + '.html';

		const htmlCode = `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.name}</title>
</head>
<body>
    <script src="https://www.unpkg.com/odyc@${game.version}/dist/index.global.js"><\/script>
    <script>
${code}
    <\/script>
</body>
</html>
`;

		const downloadLink = document.createElement('a');
		const encodedContent = encodeURIComponent(htmlCode);
		downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + encodedContent);
		downloadLink.setAttribute('download', fileName);
		downloadLink.style.display = 'none';
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	function onSaveCodeStart() {
		getGameBlob();
	}

	async function onSaveCodeFinish(screenshot: Blob) {
		try {
			const file = await Backend.createScreenshotFile(screenshot);
			await Backend.updateGameCode(game.$id, code, file.$id);
			await invalidate(Dependencies.GAMES);
			toast.success('Game code successfully saved.');
			hasChangedCode = false;
		} catch (error: any) {
			toast.error(error.message);
		}
	}

	let showSaveAsDialog = $state(false);
	function setShowSaveAsDialog(value: boolean) {
		showSaveAsDialog = value;
	}

	let saveAsName = $state(game.name ? game.name + ' (copy)' : '');
	let isSavingAs = $state(false);
	async function onSaveAs() {
		if (isSavingAs) return;

		isSavingAs = true;
		try {
			const newGame = await Backend.createGame(saveAsName, code);
			await invalidate(Dependencies.GAMES);
			toast.success('Game successfully copied.');
			setShowSaveAsDialog(false);
			await goto('/dashboard/games/' + newGame.$id);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isSavingAs = false;
		}
	}

	let showDeleteDialog = $state(false);
	function setShowDeleteDialog(value: boolean) {
		showDeleteDialog = value;
	}

	let isDeleting = $state(false);
	async function onDelete() {
		if (isDeleting) return;

		isDeleting = true;
		try {
			await Backend.deleteGame(game.$id);
			toast.success('Game successfully deleted.');
			await goto('/dashboard/overview');
			await invalidate(Dependencies.GAMES);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isDeleting = false;
		}
	}

	let showVersionDialog = $state(false);
	function setShowVersionDialog(value: boolean) {
		showVersionDialog = value;
	}

	const versions = [...OdycVersions].reverse().map((version) => {
		return {
			value: version,
			label: version
		};
	});
	let versionOpen = $state(false);
	let versionValue = $state(game.version);
	let versionRef = $state<HTMLButtonElement>(null!);
	const versionSelected = $derived(versions.find((f) => f.value === versionValue)?.label);
	function closeAndFocusVersionsTrigger() {
		versionOpen = false;
		tick().then(() => {
			versionRef.focus();
		});
	}

	let isChangingVersion = $state(false);
	async function onChangeVersion() {
		if (isChangingVersion) return;

		isChangingVersion = true;
		try {
			await Backend.updateGameVersion(game.$id, versionSelected ?? PUBLIC_ODYC_VERSION);
			toast.success('Game version successfully changed.');
			await invalidate(Dependencies.GAMES);
			showVersionDialog = false;
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isChangingVersion = false;
		}
	}

	let showUrlDialog = $state(false);
	function setShowUrlDialog(value: boolean) {
		showUrlDialog = value;
	}

	let gameUrl = $state(game.slug);
	let isChangingUrl = $state(false);
	async function onChangeUrl() {
		if (isChangingUrl) return;

		isChangingUrl = true;
		try {
			await Backend.updateGameUrl(game.$id, gameUrl);
			toast.success('Game URL successfully changed.');
			await invalidate(Dependencies.GAMES);
			showUrlDialog = false;
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isChangingUrl = false;
		}
	}

	let showDescriptionDialog = $state(false);
	function setShowDescriptionDialog(value: boolean) {
		showDescriptionDialog = value;
	}

	let description = $state(game.description ?? '');
	let howToPlay = $state(game.howToPlay ?? '');
	let isChangingDescription = $state(false);
	async function onChangeDescription(event: Event) {
		event.preventDefault();

		if (isChangingDescription) return;

		isChangingDescription = true;
		try {
			await Backend.updateGameDescription(game.$id, description, howToPlay);
			toast.success('Game description successfully changed.');
			await invalidate(Dependencies.GAMES);
			showDescriptionDialog = false;
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isChangingDescription = false;
		}
	}

	let showRenameDialog = $state(false);
	function setShowRenameDialog(value: boolean) {
		showRenameDialog = value;
	}

	let renameName = $state(game.name);
	let isRenaming = $state(false);
	async function onRename() {
		if (isRenaming) return;

		isRenaming = true;
		try {
			await Backend.updateGameName(game.$id, renameName);
			toast.success('Game successfully renamed.');
			await invalidate(Dependencies.GAMES);
			showRenameDialog = false;
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			isRenaming = false;
		}
	}

	function onFormat() {
		editor.formatCode();
	}

	let spriteEditor = $state('');
	let showSpriteEditor = $state(false);
	function setShowSpriteEditor(value: boolean) {
		showSpriteEditor = value;
	}

	let spriteEditorWidth = $state(8);
	let spriteEditorHeight = $state(8);

	function onSpriteCopy() {
		navigator.clipboard.writeText(spriteEditor);
		toast.success('Sprite copied to clipboard.');
		setShowSpriteEditor(false);
	}

	function onLoadSprite() {
		navigator.clipboard.readText().then((text) => {
			spriteEditor = text;
			toast.success('Sprite loaded from clipboard.');
		});
	}
</script>

<div class="mx-auto mb-3 h-full w-full max-w-7xl p-4 lg:p-6">
	<Breadcrumb.Root class="mb-3">
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/dashboard/overview">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>{game.name}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="mb-3 w-[max-content]">
		<Menubar.Root>
			<Menubar.Menu>
				<Menubar.Trigger class="relative">
					{#if hasChangedCode}
						<div
							class="absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 transform animate-ping rounded-full bg-yellow-500"
						></div>
						<div
							class="absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 transform rounded-full bg-yellow-500"
						></div>
					{/if}
					File
				</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item onclick={onSaveCodeStart} class="flex items-center justify-start gap-2">
						{#if hasChangedCode}
							<div class="relative">
								<div
									class="absolute size-3 transform animate-ping rounded-full bg-yellow-500"
								></div>
								<div class="size-3 transform rounded-full bg-yellow-500"></div>
							</div>
						{/if}
						<span class="w-full">Save</span>
						<div class="flex items-center justify-end gap-0.5">
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>{ctrlKey}</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>S</kbd
							>
						</div>
					</Menubar.Item>

					<Menubar.Item onclick={() => setShowSaveAsDialog(true)}>
						<span class="w-full">Save as...</span>
						<div class="flex items-center justify-end gap-0.5">
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>{ctrlKey}</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>Shift</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>S</kbd
							>
						</div>
					</Menubar.Item>

					<Menubar.Item onclick={onDownload}>
						<span class="w-full">Download</span>
						<div class="flex items-center justify-end gap-0.5">
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>{ctrlKey}</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>Shift</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>D</kbd
							>
						</div>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item onclick={onFormat}>
						<span class="w-full">Format code</span>
						<div class="flex items-center justify-end gap-0.5">
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>{ctrlKey}</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>Shift</kbd
							>
							<kbd
								class="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none"
								>F</kbd
							>
						</div>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Use template...</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger>Edit</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item onclick={() => setShowSpriteEditor(true)}>Sprite</Menubar.Item>
					<Menubar.Item>Map</Menubar.Item>
					<Menubar.Item>Sounds</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger class="relative">
					{#if isRecording}
						<div
							class="absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 transform animate-ping rounded-full bg-red-500"
						></div>
						<div
							class="absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500"
						></div>
					{/if}
					<span>View</span>
				</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item onclick={onFullscreen}>Open in fullscreen</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item onclick={onScreenshot}>Take a screenshot</Menubar.Item>
					{#if isRecording}
						<Menubar.Item onclick={stopRecording} class="flex items-center justify-start gap-2">
							<div class="relative">
								<div class="absolute size-3 transform animate-ping rounded-full bg-red-500"></div>
								<div class="size-3 transform rounded-full bg-red-500"></div>
							</div>
							<span>Stop video recording</span></Menubar.Item
						>
					{:else}
						<Menubar.Item onclick={startRecording}>Start video recording</Menubar.Item>
					{/if}
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger>Settings</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item onclick={() => setShowRenameDialog(true)}>Change name</Menubar.Item>
					<Menubar.Item onclick={() => setShowUrlDialog(true)}>Change URL</Menubar.Item>
					<Menubar.Item onclick={() => setShowDescriptionDialog(true)}
						>Change Description</Menubar.Item
					>
					<Menubar.Separator />
					<Menubar.Item onclick={() => setShowVersionDialog(true)}>Change Version</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item onclick={() => setShowDeleteDialog(true)} variant="destructive"
						>Delete project</Menubar.Item
					>
				</Menubar.Content>
			</Menubar.Menu>
		</Menubar.Root>
	</div>

	<div class="grid h-full grid-cols-12 gap-4">
		<Card.Root class="col-span-12 h-full max-h-[608px] p-0 md:col-span-6">
			<Card.Content class="h-full p-2">
				<Editor
					bind:code
					withVim={stores?.user?.prefs?.vimModeEnabled}
					bind:this={editor}
					handleChange={onEditorChange}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root class="col-span-12 h-full max-h-[608px] p-0 md:col-span-6">
			<Card.Content class="h-full p-2">
				<div class="relative h-full w-full overflow-hidden rounded-md">
					<iframe
						class="h-full w-full"
						id="preview"
						src={(PUBLIC_IFRAME_ENDPOINT ?? '/iframe') + '?version=' + game.version}
						title="Game preview"
					></iframe>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<Dialog.Root open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onSaveAs}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>Save as new game</Dialog.Title>
				<Dialog.Description>Make a copy of this game.</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-name">Game name</Label>
					<Input
						required={true}
						bind:value={saveAsName}
						type="text"
						id="game-name"
						placeholder="Awesome game"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isSavingAs} type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showRenameDialog} onOpenChange={setShowRenameDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onRename}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>Rename your game</Dialog.Title>
				<Dialog.Description>Change name of your game.</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-name">Game name</Label>
					<Input
						required={true}
						bind:value={renameName}
						type="text"
						id="game-name"
						placeholder="Awesome game"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isRenaming} type="submit">Update</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showUrlDialog} onOpenChange={setShowUrlDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onChangeUrl}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>Change game's URL</Dialog.Title>
				<Dialog.Description
					>Change public URL you can share to let others play your game.</Dialog.Description
				>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-url">Game URL</Label>

					<div class="flex items-center gap-1">
						<Input
							required={true}
							bind:value={gameUrl}
							type="text"
							id="game-url"
							placeholder="awesome-game"
						/>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isChangingUrl} type="submit">Update</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showVersionDialog} onOpenChange={setShowVersionDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onChangeVersion}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>Upgrade your game version</Dialog.Title>
				<Dialog.Description
					>Increase or lower Odyc.js engine version used in your game.</Dialog.Description
				>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-url">Odyc.js version</Label>

					<div class="flex items-center gap-1">
						<Popover.Root bind:open={versionOpen}>
							<Popover.Trigger bind:ref={versionRef}>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										class="w-[200px] justify-between"
										role="combobox"
									>
										{versionValue || 'Select a version...'}
										<ChevronsUpDownIcon class="opacity-50" />
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-[200px] p-0">
								<Command.Root>
									<Command.Input placeholder="Search versions..." />
									<Command.List>
										<Command.Empty>No version found.</Command.Empty>
										<Command.Group value="versions">
											{#each versions as version (version.value)}
												<Command.Item
													value={version.value}
													onSelect={() => {
														versionValue = version.value;
														closeAndFocusVersionsTrigger();
													}}
												>
													<CheckIcon
														class={cn(versionValue !== version.value && 'text-transparent')}
													/>
													{version.label}
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.List>
								</Command.Root>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isChangingVersion} type="submit">Update</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Sheet.Root open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
	<Sheet.Content>
		<form onsubmit={onChangeDescription}>
			<Sheet.Header>
				<Sheet.Title>Edit game description</Sheet.Title>
				<Sheet.Description>
					Describe story of your game, rules, and how to play in general.
				</Sheet.Description>
			</Sheet.Header>

			<div class="grid flex-1 auto-rows-min gap-6 px-4">
				<div class="grid gap-3">
					<Label for="description" class="text-right">Description</Label>
					<Textarea
						bind:value={description}
						id="description"
						placeholder="Short description of your game."
					/>
				</div>
				<div class="grid gap-3">
					<Label for="howToPlay" class="text-right">How to play</Label>
					<Textarea
						bind:value={howToPlay}
						id="howToPlay"
						placeholder="Controls and rules of your game."
					/>
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="outline">Update</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>

<AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				Deleted game cannot be recovered. We highly recommend to download it to your PC first, just
				in case.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={onDelete} disabled={isDeleting}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root open={showSpriteEditor} onOpenChange={setShowSpriteEditor}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="mb-2">
			<Dialog.Title>Sprite editor</Dialog.Title>
			<Dialog.Description>Simple painting tool to illustrate Odyc sprites</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<Paint
			resize={true}
			width={spriteEditorWidth}
			height={spriteEditorHeight}
			bind:sprite={spriteEditor}
		/>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={onLoadSprite}>Load from clipboard</Button>
			<Button type="button" onclick={onSpriteCopy}>Copy</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
