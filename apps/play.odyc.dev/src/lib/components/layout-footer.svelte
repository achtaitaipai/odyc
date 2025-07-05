<script>
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-primary-foreground flex flex-col items-center justify-center gap-4 pt-6 pb-4">
	<a href="/" class="flex items-center gap-2">
		<img src="/logo.png" alt="Odyc.js Logo" class="pixelated h-5 w-5" />

		<h1 class="font-pixel text-2xl font-medium">Odyc.js</h1>
	</a>

	<div class="relative inline-flex w-[fit-content] gap-6 font-light">
		<a class="hover:underline" href="/">Dashboard</a>
		<a class="hover:underline" href="https://odyc.dev/" target="_blank">Documentation</a>
		<a class="hover:underline" href="https://github.com/achtaitaipai/odyc" target="_blank">GitHub</a
		>
		<a class="hover:underline" href="https://discord.gg/fH53NGAmr4" target="_blank">Discord</a>
	</div>

	<Separator />
	<div
		class="i mx-auto mt-4 flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-lg sm:flex-row"
	>
		<p class="text-muted-foreground text-sm font-light">
			© {currentYear} Odyc.js. All rights reserved.
		</p>

		<p class="font text-muted-foreground text-sm font-light">
			Made with love and
			<a href="https://appwrite.io/" class="text-[#FD366E] hover:underline" target="_blank">
				Appwrite</a
			>
		</p>
	</div>
</footer>
