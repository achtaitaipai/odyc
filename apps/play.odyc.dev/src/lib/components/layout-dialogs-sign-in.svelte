<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { stores } from '$lib/stores.svelte';

	let { children } = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{@render children()}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{stores.t('auth.newHere')}</AlertDialog.Title>
			<AlertDialog.Description>
				{stores.t('auth.firstTimeConnecting')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel></AlertDialog.Cancel>
			<AlertDialog.Action>{stores.t('auth.signInToExisting')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
