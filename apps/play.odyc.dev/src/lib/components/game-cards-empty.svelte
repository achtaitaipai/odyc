<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import IconQuestionMark from '@tabler/icons-svelte/icons/question-mark';
	import { Button } from '$lib/components/ui/button/index.js';

	const {
		description
	}: {
		description: string;
	} = $props();
</script>

<Card.Root class="flex h-full justify-center border-dashed bg-transparent">
	<Card.Header>
		<div class="flex justify-center">
			<Button variant="secondary" disabled size="icon" class="size-8">
				<IconQuestionMark />
			</Button>
		</div>
		<div class="mt-2">
			<Card.Title class="font-title w-full text-center text-2xl font-light"
				>Nothing here yet</Card.Title
			>

			{#if description}
				<Card.Description class="mt-2 w-full text-center text-sm">{description}</Card.Description>
			{/if}
		</div>
	</Card.Header>
</Card.Root>
