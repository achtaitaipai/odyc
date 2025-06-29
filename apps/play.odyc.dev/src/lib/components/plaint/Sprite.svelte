<script lang="ts">
	import { OdycColorsHEX } from '$lib/constants';

	type Props = {
		sprite?: string;
		class?: string;
	};

	let { sprite = '', class: className = '' }: Props = $props();
	let pixels: string[][] = $derived.by(() => updatePixels(sprite));

	function updatePixels(sprite: string) {
		const pixels: string[][] = [];
		for (const row of sprite.trim().split('\n')) {
			const arr = [];
			for (const char of row.trim().split('')) {
				let color = '';
				if (char === '.') {
					color = '#ffffff';
				} else {
					color = OdycColorsHEX[+char];
				}

				if (color) {
					arr.push(color);
				}
			}
			pixels.push(arr);
		}
		return pixels;
	}

	updatePixels(sprite);
</script>

<svg
	class={className}
	viewBox="0 0 8 8"
	xmlns="http://www.w3.org/2000/svg"
	style="background-color: white;"
>
	{#each pixels as row, y}
		{#each row as pixel, x}
			<rect width="1" height="1" {x} {y} style={`fill:${pixel};`} />
		{/each}
	{/each}
</svg>
