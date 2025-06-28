<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" lightClassNames={[]} darkClassNames={['dark']} />
{@render children()}
