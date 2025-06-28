<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import IconPlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import IconBolt from '@tabler/icons-svelte/icons/bolt';
	import IconDeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import IconSun from '@tabler/icons-svelte/icons/sun';
	import Badge from './ui/badge/badge.svelte';
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-title text-3xl">Community Highlights</h1>

	<Card.Root class="flex h-full justify-center bg-transparent">
		<Card.Header>
			<Card.Title class="font-title text-2xl font-light">Quick Arrows</Card.Title>
			<Card.Description
				>Developed by <a href="#" class="text-primary underline">Meldiron</a>
			</Card.Description>
			<div class="mt-3">
				<Badge class="text-base" variant="outline">
					<IconBolt class="text-muted-foreground !h-4 !w-4" />Reflexes</Badge
				>
				<Badge class="text-base" variant="outline">
					<IconDeviceTablet class="text-muted-foreground !h-4 !w-4" />Mobile-friendly</Badge
				>
				<Badge class="text-base" variant="outline">
					<IconSun class="text-muted-foreground !h-4 !w-4" />Relaxing</Badge
				>
			</div>
			<Card.Action>
				<Button class="cursor-pointer" variant="outline"
					>Play now <IconPlayerPlayFilled class="text-muted-foreground" /></Button
				>
			</Card.Action>
		</Card.Header>
	</Card.Root>
</div>
