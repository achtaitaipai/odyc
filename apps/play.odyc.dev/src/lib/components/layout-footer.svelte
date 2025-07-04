<script>
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-primary-foreground pb-4">
	<Separator />
	<div
		class="i mx-auto mt-4 flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-lg sm:flex-row"
	>
		<p class="font text-sm font-light">
			Made with love and
			<a href="https://appwrite.io/" class="text-[#FD366E] hover:underline" target="_blank">
				Appwrite</a
			>
		</p>
		<p class="text-muted-foreground text-sm font-light">Copyright © {currentYear} Odyc.js</p>
	</div>
</footer>
