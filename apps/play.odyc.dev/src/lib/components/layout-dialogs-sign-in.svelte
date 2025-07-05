<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	let { children } = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{@render children()}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you new here?</AlertDialog.Title>
			<AlertDialog.Description>
				If it's your first time connecting with GitHub, please
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel></AlertDialog.Cancel>
			<AlertDialog.Action>Sign in to existing account</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
