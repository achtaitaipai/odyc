<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
</script>

<header
	class="flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear  py-3"
>
	<div class="flex items-center gap-1 px-4 lg:gap-2 lg:px-6 mx-auto w-full max-w-7xl">
		<a href="/" class="flex items-center gap-2">
			<img src="/logo.png" alt="Odyc.js Logo" class="pixelated h-5 w-5" />

			<h1 class="font-pixel text-2xl font-medium">Odyc.js</h1>
		</a>
		<div class="ml-auto flex items-center gap-2">
			<Button
				href="https://odyc.dev/"
				variant="outline"
				size="sm"
				class="dark:text-foreground hidden sm:flex"
				target="_blank"
				rel="noopener noreferrer"
			>
				Docs
			</Button>

			<Button
				href="https://github.com/achtaitaipai/odyc"
				variant="ghost"
				size="sm"
				class="dark:text-foreground hidden sm:flex"
				target="_blank"
				rel="noopener noreferrer"
			>
				GitHub
			</Button>

			<Button onclick={toggleMode} variant="ghost" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
