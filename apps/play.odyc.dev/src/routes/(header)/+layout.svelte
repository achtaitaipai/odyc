<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import LayoutHeader from '$lib/components/layout-header.svelte';
	import LayoutAlertsAnonymous from '$lib/components/layout-alerts-anonymous.svelte';
	import LayoutFooter from '$lib/components/layout-footer.svelte';
	import { stores } from '$lib/stores.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider
	class="pb-12"
	style="--sidebar-width: 0px; --header-height: calc(var(--spacing) * 12);"
>
	<Sidebar.Inset>
		<header>
			{#if stores.user && !stores.user?.email}
				<div class="mx-auto w-full max-w-7xl p-4 lg:p-6">
					<LayoutAlertsAnonymous />
				</div>
			{/if}

			<LayoutHeader />
		</header>

		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<LayoutFooter />
