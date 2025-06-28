<script>
	import * as Alert from '$lib/components/ui/alert/index.js';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import { Button } from '$lib/components/ui/button/index.js';
	import IconGitHub from '@lucide/svelte/icons/github';
</script>

<Alert.Root variant="warning" class="flex h-12 items-center justify-between gap-3 pr-2">
	<div class="flex items-center gap-0">
		<AlertTriangle class="mr-3 size-5" />
		<Alert.Title>You are using guest account!</Alert.Title>
		<Alert.Description class="text-accent-foreground ml-2">
			Everything you do is saved, but only this computer can access it.
		</Alert.Description>
	</div>

	<Button variant="outline" class="text-primary" size="sm">
		<IconGitHub class="size-4" />
		Sign in using GitHub
	</Button>
</Alert.Root>
