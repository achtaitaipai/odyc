<script lang="ts">
	import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { DefaultCode } from '$lib/constants';
	import { mode } from 'mode-watcher';

	let { data }: PageProps = $props();
	const { game } = data;

	const initialCode = game.code ? game.code : DefaultCode;

	let editor: ReturnType<typeof monaco.editor.create> | null;
	const editorOptions = {
		value: initialCode,
		language: 'javascript',
		automaticLayout: true
	};

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
		const preview = document.getElementById('preview') as HTMLCanvasElement;
		if (ide && preview) {
			editor = monaco.editor.create(ide, {
				...editorOptions,
				theme: mode.current === 'light' ? 'vs-light' : 'vs-dark'
			});
			editor.onDidChangeModelContent(() => {
				if (!editor) {
					return;
				}
				updateCode();
			});
		}
	});

	function updateCode() {
		if (!editor) {
			return;
		}

		// @ts-expect-error It exists, not sure why types dont see it
		const contentWindow = preview.contentWindow;
		contentWindow.postMessage(
			{
				type: 'oncodechange',
				detail: {
					code: editor.getValue()
				}
			},
			'*'
		);
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
				<Menubar.Trigger>File</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>Format code</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Save changes</Menubar.Item>
					<Menubar.Item>Download to PC</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Use template ...</Menubar.Item>
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
				<Menubar.Trigger>View</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>Open in fullscreen</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Take a screenshot</Menubar.Item>
					<Menubar.Item>Start video recording</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger>Settings</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>Change name</Menubar.Item>
					<Menubar.Item>Change URL</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item variant="destructive">Delete project</Menubar.Item>
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
					<iframe class="h-full w-full" id="preview" src={`/iframe`} title="Game preview"></iframe>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
