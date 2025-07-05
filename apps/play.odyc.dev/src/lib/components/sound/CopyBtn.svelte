<script lang="ts">
	import { page } from '$app/state';
	import { IconClipboard, IconCheck } from '@tabler/icons-svelte';
	import Button from '../ui/button/button.svelte';

	type Props = {
		toCopy: string;
	};

	let { toCopy }: Props = $props();
	let copied = $state(false);
	let timeOutId: ReturnType<typeof setTimeout> | undefined = undefined;

	function handleClick() {
		navigator.clipboard.writeText(toCopy);
		copied = true;
		if (timeOutId) clearTimeout(timeOutId);
		timeOutId = setTimeout(() => {
			copied = false;
			timeOutId = undefined;
		}, 1000);
	}
</script>

<Button size="icon" variant="ghost" onclick={handleClick} class="hover:bg-transparent">
	{#if copied}
		<IconCheck />
	{:else}
		<IconClipboard />
	{/if}
</Button>
