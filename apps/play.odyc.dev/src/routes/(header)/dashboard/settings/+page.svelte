<script lang="ts">
	import Paint from '$lib/components/plaint/Paint.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { stores } from '$lib/stores.svelte';
	import Sprite from '$lib/components/plaint/Sprite.svelte';
	import { DefaultProfilePicture, Dependencies } from '$lib/constants';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { Backend } from '$lib/backend';
	import { invalidate } from '$app/navigation';

	let name = $state(stores.profile?.name ?? '');
	let sprite = $state(stores.profile?.avatarPixels ?? DefaultProfilePicture);

	let isLoading = $state(false);

	async function onSave(event: Event) {
		event.preventDefault();

		isLoading = true;

		try {
			await Backend.updateProfile(stores.profile?.$id ?? '', name, sprite);
			await invalidate(Dependencies.PROFILE);
			toast.success('Profile updated successfully.');
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl p-3">
	<form onsubmit={onSave}>
		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>Profile settings</Card.Title>
				<Card.Description>Configure your public presence on Odyc.js Play</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" type="text" bind:value={name} placeholder="Awesome gamer" required />
					</div>
					<div class="grid gap-2">
						<Label class="text-center">Profile picture</Label>
						<Card.Root class="w-[max-content] rounded-md">
							<Card.Content class="flex flex-col items-center gap-4">
								<Sprite class="aspect-square w-full max-w-40" {sprite} />

								<AlertDialog.Root>
									<AlertDialog.Trigger>
										<div>
											<Button type="button" variant="outline">Open editor</Button>
										</div>
									</AlertDialog.Trigger>
									<AlertDialog.Content>
										<AlertDialog.Header>
											<AlertDialog.Title>Profile picture editor</AlertDialog.Title>
											<AlertDialog.Description>
												<p>Paint your own avatar.</p>

												<Paint bind:sprite />
											</AlertDialog.Description>
										</AlertDialog.Header>
										<AlertDialog.Footer>
											<AlertDialog.Cancel>Close editor</AlertDialog.Cancel>
										</AlertDialog.Footer>
									</AlertDialog.Content>
								</AlertDialog.Root>
							</Card.Content>
						</Card.Root>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="w-full flex-col items-end gap-2">
				<Button disabled={isLoading} type="submit">Save changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
