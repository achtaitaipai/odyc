<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import LayoutFooter from '$lib/components/layout-footer.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider
	class="pb-12"
	style="--sidebar-width: 0px; --header-height: calc(var(--spacing) * 12);"
>
	<Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<LayoutFooter />
