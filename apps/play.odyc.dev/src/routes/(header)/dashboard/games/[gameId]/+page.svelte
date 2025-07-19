<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import RotateIcon from '@lucide/svelte/icons/rotate-cw';
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
	import * as Card from '$lib/components/ui/card';
	import { DefaultCode, Dependencies, TemplateGroups } from '$lib/constants';
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
	import Sound from '$lib/components/sound/Sound.svelte';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

	const initialCode = $derived(game.code ? game.code : DefaultCode);
	let code = $derived(initialCode);
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
			if (!confirm(stores.t('editor.unsavedChangesWarning'))) {
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

	function updateCode(force = false) {
		hasChangedCode = code !== initialCode;

		if (!autoRefresh && !force) {
			return;
		}

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

		const htmlCode = `<!DOCTYPE html>
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

	async function onSaveCodeFinish(screenshot: Blob | null) {
		try {
			if (screenshot) {
				const file = await Backend.createScreenshotFile(screenshot);
				await Backend.updateGameCode(game.$id, code, file.$id);
			} else {
				await Backend.updateGameCode(game.$id, code, undefined);
			}
			await invalidate(Dependencies.GAMES);
			toast.success(stores.t('editor.codeSavedSuccess'));
			hasChangedCode = false;
		} catch (error: any) {
			toast.error(error.message);
		}
	}

	let showSaveAsDialog = $state(false);
	function setShowSaveAsDialog(value: boolean) {
		showSaveAsDialog = value;
	}

	let saveAsName = $derived(game.name ? game.name + ' (copy)' : '');
	let isSavingAs = $state(false);
	async function onSaveAs() {
		if (isSavingAs) return;

		isSavingAs = true;
		try {
			const newGame = await Backend.createGame(saveAsName, code);
			await invalidate(Dependencies.GAMES);
			toast.success(stores.t('editor.gameCopiedSuccess'));
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
			toast.success(stores.t('editor.gameDeletedSuccess'));
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
	let versionValue = $derived(game.version);
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
			await Backend.updateGameVersion(game.$id, versionSelected ?? PUBLIC_ODYC_VERSION ?? 'latest');
			toast.success(stores.t('editor.versionChangedSuccess'));
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

	let gameUrl = $derived(game.slug);
	let isChangingUrl = $state(false);
	async function onChangeUrl() {
		if (isChangingUrl) return;

		isChangingUrl = true;
		try {
			await Backend.updateGameUrl(game.$id, gameUrl);
			toast.success(stores.t('editor.urlChangedSuccess'));
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

	let description = $derived(game.description ?? '');
	let howToPlay = $derived(game.howToPlay ?? '');
	let isChangingDescription = $state(false);
	async function onChangeDescription(event: Event) {
		event.preventDefault();

		if (isChangingDescription) return;

		isChangingDescription = true;
		try {
			await Backend.updateGameDescription(game.$id, description, howToPlay);
			toast.success(stores.t('editor.descriptionChangedSuccess'));
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

	let renameName = $derived(game.name);
	let isRenaming = $state(false);
	async function onRename() {
		if (isRenaming) return;

		isRenaming = true;
		try {
			await Backend.updateGameName(game.$id, renameName);
			toast.success(stores.t('editor.gameRenamedSuccess'));
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
		toast.success(stores.t('editor.spriteCopiedSuccess'));
		setShowSpriteEditor(false);
	}

	function onLoadSprite() {
		navigator.clipboard.readText().then((text) => {
			spriteEditor = text;
			toast.success(stores.t('editor.spriteLoadedSuccess'));
		});
	}

	let showSoundEditor = $state(false);
	function setShowSoundEditor(value: boolean) {
		showSoundEditor = value;
	}

	let showExamples = $state(false);
	function setShowExamples(value: boolean) {
		showExamples = value;
	}

	let templateOpen = $state(false);
	let templateValue = $state('');
	let templateLabel = $state('');
	let templateRef = $state<HTMLButtonElement>(null!);
	function closeAndFocusTemplateTrigger() {
		templateOpen = false;
		tick().then(() => {
			templateRef.focus();
		});
	}

	function onTemplateSelect() {
		if (!templateValue) {
			toast.error(stores.t('editor.selectTemplateError'));
			return;
		}

		showExamples = false;
		templateOpen = false;

		let newCode = '';

		for (const group of TemplateGroups) {
			for (const template of group.templates) {
				if (template.value === templateValue) {
					newCode = template.code;
					break;
				}
			}
		}

		code = newCode;
		updateCode();
	}

	let autoRefresh = $state(true);
	function onForceRefresh() {
		updateCode(true);
	}

	let isShareModalOpen = $state(false);
	function setShareModalOpen(open: boolean) {
		isShareModalOpen = open;
	}

	function onOpenEmbed() {
		const embedUrl = `${window.location.origin}/embed/${game.slug}`;
		window.open(embedUrl, '_blank')?.focus();
	}

	function onOpenPublic() {
		const url = `${window.location.origin}/g/${game.slug}`;
		window.open(url, '_blank')?.focus();
	}

	function onCopyPublic() {
		const url = `${window.location.origin}/g/${game.slug}`;
		navigator.clipboard.writeText(url);
		toast.success(stores.t('editor.urlCopied'));
	}

	function onCopyEmbed() {
		const embed = `<iframe src="${window.location.origin}/embed/${game.slug}"></iframe>`;
		navigator.clipboard.writeText(embed);
		toast.success(stores.t('editor.embedCopied'));
	}
</script>

<div class="mx-auto mb-3 h-full w-full max-w-7xl p-4 lg:p-6">
	<Breadcrumb.Root class="mb-3">
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/dashboard/overview">{stores.t('nav.home')}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>{game.name}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="mb-3 grid grid-cols-6 gap-6 sm:grid-cols-12">
		<div class="col-span-6 w-[fit-content]">
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
						{stores.t('editor.file')}
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
							<span class="w-full">{stores.t('editor.save')}</span>
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
							<span class="w-full">{stores.t('editor.saveAs')}</span>
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
							<span class="w-full">{stores.t('editor.download')}</span>
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
						<Menubar.Item onclick={() => (isShareModalOpen = true)}>
							<span class="w-full">{stores.t('editor.share')}</span>
						</Menubar.Item><Menubar.Item disabled={true}>
							<span class="w-full">{stores.t('editor.collaborate')}</span>
						</Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item onclick={onFormat}>
							<span class="w-full">{stores.t('editor.formatCode')}</span>
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
						<Menubar.Item onclick={() => setShowExamples(true)}
							>{stores.t('editor.loadExample')}</Menubar.Item
						>
					</Menubar.Content>
				</Menubar.Menu>

				<Menubar.Menu>
					<Menubar.Trigger>{stores.t('editor.edit')}</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item onclick={() => setShowSpriteEditor(true)}
							>{stores.t('editor.sprite')}</Menubar.Item
						>
						<Menubar.Item onclick={() => setShowSoundEditor(true)}
							>{stores.t('editor.sound')}</Menubar.Item
						>
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
						<span>{stores.t('editor.view')}</span>
					</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item onclick={onFullscreen}>{stores.t('editor.openFullscreen')}</Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item onclick={onScreenshot}>{stores.t('editor.takeScreenshot')}</Menubar.Item>
						{#if isRecording}
							<Menubar.Item onclick={stopRecording} class="flex items-center justify-start gap-2">
								<div class="relative">
									<div class="absolute size-3 transform animate-ping rounded-full bg-red-500"></div>
									<div class="size-3 transform rounded-full bg-red-500"></div>
								</div>
								<span>{stores.t('editor.stopVideoRecording')}</span></Menubar.Item
							>
						{:else}
							<Menubar.Item onclick={startRecording}
								>{stores.t('editor.startVideoRecording')}</Menubar.Item
							>
						{/if}
					</Menubar.Content>
				</Menubar.Menu>

				<Menubar.Menu>
					<Menubar.Trigger>{stores.t('editor.settings')}</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item onclick={() => setShowRenameDialog(true)}
							>{stores.t('editor.changeName')}</Menubar.Item
						>
						<Menubar.Item onclick={() => setShowUrlDialog(true)}
							>{stores.t('editor.changeURL')}</Menubar.Item
						>
						<Menubar.Item onclick={() => setShowDescriptionDialog(true)}
							>{stores.t('editor.changeDescription')}</Menubar.Item
						>
						<Menubar.Separator />
						<Menubar.Item onclick={() => setShowVersionDialog(true)}
							>{stores.t('editor.changeVersion')}</Menubar.Item
						>
						<Menubar.Separator />
						<Menubar.Item onclick={() => setShowDeleteDialog(true)} variant="destructive"
							>{stores.t('editor.deleteProject')}</Menubar.Item
						>
					</Menubar.Content>
				</Menubar.Menu>
			</Menubar.Root>
		</div>
		<div class="col-span-6 flex w-full gap-4 sm:justify-end">
			<div class="flex items-center space-x-2">
				<Switch bind:checked={autoRefresh} id="auto-refresh" />
				<Label for="auto-refresh">Auto-refresh</Label>
			</div>

			<Button
				onclick={onForceRefresh}
				disabled={autoRefresh}
				variant="outline"
				size="icon"
				class="size-8"
			>
				<RotateIcon />
			</Button>
		</div>
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
						title={stores.t('editor.gamePreview')}
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
				<Dialog.Title>{stores.t('editor.saveAsNewGame')}</Dialog.Title>
				<Dialog.Description>{stores.t('editor.saveAsDescription')}</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-name">{stores.t('editor.gameName')}</Label>
					<Input
						required={true}
						bind:value={saveAsName}
						type="text"
						id="game-name"
						placeholder={stores.t('editor.gameNamePlaceholder')}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isSavingAs} type="submit">{stores.t('ui.create')}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showRenameDialog} onOpenChange={setShowRenameDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onRename}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>{stores.t('editor.renameGameTitle')}</Dialog.Title>
				<Dialog.Description>{stores.t('editor.renameGameDescription')}</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-name">{stores.t('editor.gameName')}</Label>
					<Input
						required={true}
						bind:value={renameName}
						type="text"
						id="game-name"
						placeholder={stores.t('editor.gameNamePlaceholder')}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isRenaming} type="submit">{stores.t('ui.update')}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showUrlDialog} onOpenChange={setShowUrlDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onChangeUrl}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>{stores.t('editor.changeGameUrlTitle')}</Dialog.Title>
				<Dialog.Description>{stores.t('editor.changeGameUrlDescription')}</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-url">{stores.t('editor.gameUrlLabel')}</Label>

					<div class="flex items-center gap-1">
						<Input
							required={true}
							bind:value={gameUrl}
							type="text"
							id="game-url"
							placeholder={stores.t('editor.gameUrlPlaceholder')}
						/>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={isChangingUrl} type="submit">{stores.t('ui.update')}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showVersionDialog} onOpenChange={setShowVersionDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onChangeVersion}>
			<Dialog.Header class="mb-2">
				<Dialog.Title>{stores.t('editor.upgradeVersionTitle')}</Dialog.Title>
				<Dialog.Description>{stores.t('editor.upgradeVersionDescription')}</Dialog.Description>
			</Dialog.Header>

			<Separator />

			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="game-url">{stores.t('editor.odycVersionLabel')}</Label>

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
										{versionValue || stores.t('editor.selectVersionPlaceholder')}
										<ChevronsUpDownIcon class="opacity-50" />
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-[200px] p-0">
								<Command.Root>
									<Command.Input placeholder={stores.t('editor.searchVersions')} />
									<Command.List>
										<Command.Empty>{stores.t('editor.noVersionFound')}</Command.Empty>
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
				<Button disabled={isChangingVersion} type="submit">{stores.t('ui.update')}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Sheet.Root open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
	<Sheet.Content>
		<form onsubmit={onChangeDescription}>
			<Sheet.Header>
				<Sheet.Title>{stores.t('editor.editDescriptionTitle')}</Sheet.Title>
				<Sheet.Description>
					{stores.t('editor.editDescriptionDescription')}
				</Sheet.Description>
			</Sheet.Header>

			<div class="grid flex-1 auto-rows-min gap-6 px-4">
				<div class="grid gap-3">
					<Label for="description" class="text-right">{stores.t('editor.descriptionLabel')}</Label>
					<Textarea
						bind:value={description}
						id="description"
						placeholder={stores.t('editor.descriptionPlaceholder')}
					/>
				</div>
				<div class="grid gap-3">
					<Label for="howToPlay" class="text-right">{stores.t('editor.howToPlayLabel')}</Label>
					<Textarea
						bind:value={howToPlay}
						id="howToPlay"
						placeholder={stores.t('editor.howToPlayPlaceholder')}
					/>
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="outline">{stores.t('ui.update')}</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>

<AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{stores.t('editor.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{stores.t('editor.deleteConfirmDescription')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{stores.t('ui.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={onDelete} disabled={isDeleting}
				>{stores.t('games.continue')}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root open={showSpriteEditor} onOpenChange={setShowSpriteEditor}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="mb-2">
			<Dialog.Title>{stores.t('editor.spriteEditorTitle')}</Dialog.Title>
			<Dialog.Description>{stores.t('editor.spriteEditorDescription')}</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<Paint
			resize={true}
			width={spriteEditorWidth}
			height={spriteEditorHeight}
			bind:sprite={spriteEditor}
		/>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={onLoadSprite}
				>{stores.t('editor.loadFromClipboard')}</Button
			>
			<Button type="button" onclick={onSpriteCopy}>{stores.t('editor.copy')}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showSoundEditor} onOpenChange={setShowSoundEditor}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="mb-2">
			<Dialog.Title>{stores.t('editor.soundEditorTitle')}</Dialog.Title>
		</Dialog.Header>

		<Separator />

		<Sound />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={showExamples} onOpenChange={setShowExamples}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{stores.t('editor.loadCodeExampleTitle')}</Dialog.Title>
			<Dialog.Description>
				{stores.t('editor.loadCodeExampleDescription')}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Popover.Root bind:open={templateOpen}>
				<Popover.Trigger bind:ref={templateRef}>
					{#snippet child({ props })}
						<Button {...props} variant="outline" class="w-full justify-between" role="combobox">
							{templateLabel || stores.t('editor.selectTemplatePlaceholder')}
							<ChevronsUpDownIcon class="opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Input placeholder={stores.t('editor.searchTemplates')} />
						<Command.List>
							<Command.Empty>{stores.t('editor.noTemplateFound')}</Command.Empty>
							{#each TemplateGroups as group (group.title)}
								<Command.Group heading={group.title}>
									{#each group.templates as template (template.value)}
										<Command.Item
											keywords={[template.value, template.label]}
											value={template.value}
											onSelect={() => {
												templateValue = template.value;
												templateLabel = template.label;
												closeAndFocusTemplateTrigger();
											}}
										>
											<CheckIcon
												class={cn(templateValue !== template.value && 'text-transparent')}
											/>
											{template.label}
										</Command.Item>
									{/each}
								</Command.Group>
							{/each}
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
		<Dialog.Footer>
			<Button type="button" onclick={onTemplateSelect}>{stores.t('editor.load')}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isShareModalOpen} onOpenChange={setShareModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{stores.t('editor.shareTitle')}</Dialog.Title>
			<Dialog.Description>
				{stores.t('editor.shareDescription')}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid items-center gap-2">
				<Label for="share-embed" class="text-right">{stores.t('editor.shareEmbedLabel')}</Label>

				<div class="flex items-center">
					<Input
						readonly={true}
						id="share-embed"
						value={`<iframe src="${window.location.origin}/embed/${game.slug}"></iframe>`}
						class="border-r-background col-span-3 rounded-r-none"
					/>
					<div class="flex h-full">
						<Button
							onclick={onOpenEmbed}
							variant="outline"
							size="icon"
							class="size-8 h-[36px] flex-shrink-0 rounded-none"
						>
							<ExternalLinkIcon />
						</Button>
						<Button
							onclick={onCopyEmbed}
							variant="outline"
							size="icon"
							class="size-8 h-[36px] flex-shrink-0 rounded-l-none"
						>
							<CopyIcon />
						</Button>
					</div>
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="share-url" class="text-right">{stores.t('editor.sharePlayableUrlLabel')}</Label>
				<div class="flex items-center">
					<Input
						readonly={true}
						id="share-url"
						value={`${window.location.origin}/g/${game.slug}`}
						class="border-r-background col-span-3 rounded-r-none"
					/>
					<div class="flex h-full">
						<Button
							onclick={onOpenPublic}
							variant="outline"
							size="icon"
							class="size-8 h-[36px] flex-shrink-0 rounded-none"
						>
							<ExternalLinkIcon />
						</Button>
						<Button
							onclick={onCopyPublic}
							variant="outline"
							size="icon"
							class="size-8 h-[36px] flex-shrink-0 rounded-l-none"
						>
							<CopyIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={() => setShareModalOpen(false)} variant="outline" type="button"
				>{stores.t('editor.close')}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
