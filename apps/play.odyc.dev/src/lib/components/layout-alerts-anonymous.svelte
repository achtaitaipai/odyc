<script>
	import * as Alert from '$lib/components/ui/alert/index.js';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import { Button } from '$lib/components/ui/button/index.js';
	import IconGitHub from '@lucide/svelte/icons/github';
	import { Backend } from '$lib/backend';

	function onSignIn() {
		Backend.signInGitHub();
	}
</script>

<Alert.Root
	variant="warning"
	class="flex flex-col items-center justify-between gap-3 pr-2 md:flex-row"
>
	<div class="flex flex-col items-center gap-2 text-center md:flex-row md:gap-0 md:text-left">
		<AlertTriangle class="mr-3 size-5 flex-shrink-0" />
		<Alert.Title class="flex-shrink-0">You are using guest account!</Alert.Title>
		<Alert.Description class="text-accent-foreground ml-2">
			Everything you do is saved, but only this computer can access it.
		</Alert.Description>
	</div>

	<Button onclick={onSignIn} variant="outline" class="text-primary cursor-pointer" size="sm">
		<IconGitHub class="size-4" />
		Connect with GitHub
	</Button>
</Alert.Root>
