<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import IconLock from '@tabler/icons-svelte/icons/lock';
	import { Badge } from '$lib/components/ui/badge/index.js';
</script>

<Card.Root class="flex  justify-center overflow-hidden p-0">
	<Card.Header class="p-0">
		<div class="relative">
			<div class="absolute top-2 right-2">
				<Badge variant="outline" class="bg-background border-muted border">
					Private <IconLock class="text-muted-foreground" />
				</Badge>
			</div>
			<img
				alt="Screenshot of forest hike"
				src="https://odyc.dev/gallery/forest-hike.png"
				class="aspect-video w-full object-cover object-center"
			/>
		</div>

		<div class="px-3 pt-1">
			<Card.Title class="font-title w-full text-lg font-light"
				>Forest Hike
				<span></span>
			</Card.Title>

			<Card.Description class="mb-2.5 text-xs">Last changed 3 days ago</Card.Description>
		</div>
	</Card.Header>
</Card.Root>
