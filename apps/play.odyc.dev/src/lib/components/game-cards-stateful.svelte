<script lang="ts">
	import type { Games } from '$lib/appwrite';
	import * as Card from '$lib/components/ui/card/index.js';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import dayjs from 'dayjs';

	const {
		game
	}: {
		game: Games;
	} = $props();

	dayjs.extend(relativeTime);
</script>

<a href={`/dashboard/games/${game.$id}`}>
	<Card.Root class="flex  justify-center overflow-hidden p-0">
		<Card.Header class="p-0">
			<img
				alt={`Light Screenshot of ${game.name}`}
				src="/placeholder-light.svg"
				class="block aspect-video w-full object-cover object-center dark:hidden"
			/>
			<img
				alt={`Dark Screenshot of ${game.name}`}
				src="/placeholder-dark.svg"
				class="hidden aspect-video w-full object-cover object-center dark:block"
			/>

			<div class="px-3 pt-1">
				<Card.Title class="font-title w-full text-lg font-light"
					>{game.name}
					<span></span>
				</Card.Title>

				<Card.Description class="mb-2.5 text-xs"
					>Last modified {dayjs().to(game.$createdAt)}</Card.Description
				>
			</div>
		</Card.Header>
	</Card.Root>
</a>
