<script lang="ts">
	import { onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { Workspace } from './Workspace.svelte';

	type Props = {
		code?: string;
		handleChange?: (code: string) => void;
		withVim?: boolean;
		class?: string;
	};
	let {
		code = $bindable(''),
		handleChange,
		withVim = $bindable(false),
		class: className = ''
	}: Props = $props();

	let container: HTMLElement;

	let workspace: Workspace;

	onMount(() => {
		workspace = new Workspace({
			container,
			defaultCode: code,
			onChange: onCodeChange
		});
	});

	function onCodeChange(value: string) {
		code = value;
		handleChange?.(value);
	}

	export function formatCode() {
		workspace.formatCode();
	}

	$effect(() => {
		workspace.toggleVim(withVim);
	});

	$effect(() => {
		workspace.updateCode(code);
	});
</script>

<div
	bind:this={container}
	class={twMerge('bg-base-200 h-full w-full overflow-auto shadow', className)}
></div>

<style>
	:global(.cm-editor) {
		height: 100%;
	}
</style>
