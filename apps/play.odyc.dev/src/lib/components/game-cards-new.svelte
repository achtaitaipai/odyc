<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import IconPlus from '@tabler/icons-svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Card.Root class="flex cursor-pointer justify-center">
			<Card.Header>
				<div class="flex justify-center">
					<Button variant="secondary" disabled size="icon" class="size-8">
						<IconPlus />
					</Button>
				</div>
				<div class="mt-2">
					<Card.Title class="font-title w-full text-center text-xl font-semibold"
						>Create new game</Card.Title
					>

					<Card.Description class="mt-2 w-full text-center text-sm"
						>From scratch, or using an existing template.</Card.Description
					>
				</div>
			</Card.Header>
		</Card.Root>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create new game</Dialog.Title>
			<Dialog.Description>A beginning of something amazing.</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<div class="grid gap-4 py-4">
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="game-name">Game name</Label>
				<Input type="text" id="game-name" placeholder="Pixel Journey" />
			</div>

			<div class="flex items-center gap-3">
				<Checkbox id="terms" />
				<Label for="terms">Keep the game private</Label>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit">
				<IconPlus />

				Create
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
