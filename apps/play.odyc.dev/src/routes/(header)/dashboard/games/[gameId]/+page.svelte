<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { DefaultCode, Dependencies } from '$lib/constants';
	import { mode } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { goto, invalidate } from '$app/navigation';
	import slugify from 'slugify';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { env } from '$env/dynamic/public';

	let { data }: PageProps = $props();

	const game = $derived(data.game);

	const initialCode = game.code ? game.code : DefaultCode;

	let editor: ReturnType<typeof monaco.editor.create> | null;
	const editorOptions = {
		value: initialCode,
		language: 'javascript',
		automaticLayout: true
	};

	let preview: HTMLCanvasElement | null = $state(null);

	let isRecording = $state(false);
	let hasChangedCode = $state(false);

	window.addEventListener('message', function (event) {
		if (event.data === 'on-runner-ready') {
			updateCode();
		}
	});
	$effect(() => {
		if (mode && mode.current) {
			updateTheme();
		}
	});

	function updateTheme() {
		if (editor) {
			editor.updateOptions({
				...editorOptions,
				theme: mode.current === 'light' ? 'vs-light' : 'vs-dark'
			});
		}
	}

	// Hover on each property to see its docs!
	onMount(() => {
		const ide = document.getElementById('ide');
		preview = document.getElementById('preview') as HTMLCanvasElement;
		if (ide && preview) {
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

			editor = monaco.editor.create(ide, {
				...editorOptions,
				theme: mode.current === 'light' ? 'vs-light' : 'vs-dark'
			});
			editor.onDidChangeModelContent(() => {
				if (!editor) {
					return;
				}
				hasChangedCode = true;
				updateCode();
			});
		}
	});

	function updateCode() {
		if (!editor) {
			return;
		}

		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview?.contentWindow;
		contentWindow?.postMessage(
			{
				type: 'oncodechange',
				detail: {
					code: editor.getValue()
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
		if (!editor) return;

		const fileName = slugify(game.name).toLowerCase() + '.html';
		const gameCode = editor.getValue();

		const code = `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.name}</title>
</head>
<body>
    <script src="https://www.unpkg.com/odyc@latest/dist/index.global.js"><\/script>
    <script>
${gameCode}
    <\/script>
</body>
</html>
`;

		const downloadLink = document.createElement('a');
		const encodedContent = encodeURIComponent(code);
		downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + encodedContent);
		downloadLink.setAttribute('download', fileName);
		downloadLink.style.display = 'none';
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	async function onSaveCode() {
		if (!editor) return;

		try {
			await Backend.updateGameCode(game.$id, editor.getValue());
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
		if (!editor) return;

		isSavingAs = true;
		try {
			const newGame = await Backend.createGame(saveAsName, editor.getValue());
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
					<Menubar.Item onclick={onSaveCode} class="flex items-center justify-start gap-2">
						{#if hasChangedCode}
							<div class="relative">
								<div
									class="absolute size-3 transform animate-ping rounded-full bg-yellow-500"
								></div>
								<div class="size-3 transform rounded-full bg-yellow-500"></div>
							</div>
						{/if}
						<span>Save</span>
					</Menubar.Item>

					<Menubar.Item onclick={() => setShowSaveAsDialog(true)}>Save as...</Menubar.Item>

					<Menubar.Item onclick={onDownload}>Download</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Format code</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Use template...</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger>Edit</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>Sprite</Menubar.Item>
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
					<Menubar.Item>Change URL</Menubar.Item>
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
				<div id="ide" class="h-full overflow-hidden rounded-md"></div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="col-span-12 h-full max-h-[608px] p-0 md:col-span-6">
			<Card.Content class="h-full p-2">
				<div class="relative h-full w-full overflow-hidden rounded-md">
					<iframe
						class="h-full w-full"
						id="preview"
						src={env.PUBLIC_IFRAME_ENDPOINT ?? '/iframe'}
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
