<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { Drawing } from './Drawing.svelte';
	import { twMerge } from 'tailwind-merge';
	import Button from '../ui/button/button.svelte';
	import IconFlipHorizontal from '@tabler/icons-svelte/icons/flip-horizontal';
	import IconFlipVertical from '@tabler/icons-svelte/icons/flip-vertical';
	import IconRotateClockwise from '@tabler/icons-svelte/icons/rotate-clockwise-2';
	import IconArrowMoveUp from '@tabler/icons-svelte/icons/arrow-move-up';
	import IconArrowMoveDown from '@tabler/icons-svelte/icons/arrow-move-down';
	import IconArrowMoveLeft from '@tabler/icons-svelte/icons/arrow-move-left';
	import IconArrowMoveRight from '@tabler/icons-svelte/icons/arrow-move-right';
	import IconEraser from '@tabler/icons-svelte/icons/eraser';
	import { OdycColorsHEX } from '$lib/constants';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';

	type Props = {
		sprite?: string;
		class?: string;
		width?: number;
		height?: number;
		resize?: boolean;
	};

	let { sprite = $bindable(), class: className = '', resize = false }: Props = $props();

	let canvas: HTMLCanvasElement;
	let currentColor = $state(0);

	const drawing = new Drawing(sprite);
	let ctx: CanvasRenderingContext2D;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = drawing.width;
		canvas.height = drawing.height;
		drawing.display(ctx);
	});

	$effect(() => {
		if (sprite && sprite !== untrack(() => drawing.text)) {
			drawing.text = sprite;
			drawing.display(ctx);
		}
	});

	function handleClick(e: PointerEvent) {
		e.preventDefault();
		const [x, y] = getMousePos(e);
		drawing.putPixel(x, y, currentColor);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function handleMouseMove(e: PointerEvent) {
		e.preventDefault();
		const [x, y] = getMousePos(e);
		const isPressed = e.buttons === 1;
		if (isPressed) {
			drawing.putPixel(x, y, currentColor);
			drawing.display(ctx);
			sprite = drawing.text;
		}
	}

	function mirrorX() {
		drawing.mirror();
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function mirrorY() {
		drawing.mirror(true);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	async function rotate() {
		drawing.rotate();
		await tick();
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function moveUp() {
		drawing.move(0, -1);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function moveRight() {
		drawing.move(1, 0);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function moveDown() {
		drawing.move(0, 1);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function moveLeft() {
		drawing.move(-1, 0);
		drawing.display(ctx);
		sprite = drawing.text;
	}

	function clear() {
		drawing.clear();
		drawing.display(ctx);
		sprite = drawing.text;
	}

	async function handlePaste(e: ClipboardEvent) {
		if (e.clipboardData?.files?.[0]) {
			await drawing.loadImgFile(e.clipboardData.files[0]);
			await tick();
			drawing.display(ctx);
		} else if (e.clipboardData?.getData('Text')) {
			drawing.text = e.clipboardData.getData('Text');
			await tick();
			drawing.display(ctx);
		}
	}

	function getMousePos(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const { left, top, width, height } = target.getBoundingClientRect();
		const x = Math.floor(((e.clientX - left) / width) * drawing.width);
		const y = Math.floor(((e.clientY - top) / height) * drawing.height);
		return [x, y];
	}

	async function handleChangeWidth(e: Event & { currentTarget: HTMLInputElement }) {
		drawing.resize(e.currentTarget.valueAsNumber, drawing.height);
		await tick();
		drawing.display(ctx);
		sprite = drawing.text;
		console.log(sprite);
	}

	async function handleChangeHeight(e: Event & { currentTarget: HTMLInputElement }) {
		drawing.resize(drawing.width, e.currentTarget.valueAsNumber);
		await tick();
		drawing.display(ctx);
		sprite = drawing.text;
	}
</script>

<div class={twMerge('w-full', className)} onpaste={handlePaste}>
	<div class="flex pt-2">
		<Button size="icon" variant="ghost" onclick={mirrorX}>
			<IconFlipHorizontal />
		</Button>
		<Button size="icon" variant="ghost" onclick={mirrorY}>
			<IconFlipVertical />
		</Button>
		<Button size="icon" variant="ghost" onclick={rotate}>
			<IconRotateClockwise />
		</Button>
		<Button size="icon" variant="ghost" onclick={moveUp}>
			<IconArrowMoveUp />
		</Button>
		<Button size="icon" variant="ghost" onclick={moveRight}>
			<IconArrowMoveRight />
		</Button>
		<Button size="icon" variant="ghost" onclick={moveDown}>
			<IconArrowMoveDown />
		</Button>
		<Button size="icon" variant="ghost" onclick={moveLeft}>
			<IconArrowMoveLeft />
		</Button>
		<Button size="icon" variant="ghost" onclick={clear} class="ms-auto">
			<IconEraser />
		</Button>
	</div>
	<div class="mt-3 flex aspect-square w-full">
		<canvas
			onpointerdown={(e) => handleClick(e)}
			onpointermove={(e) => handleMouseMove(e)}
			class={[
				'pixelated m-auto max-h-[400px] max-w-[400px] cursor-crosshair touch-none',
				drawing.width > drawing.height ? 'h-auto w-full' : 'h-full w-auto'
			]}
			bind:this={canvas}
			width={drawing.width}
			height={drawing.height}
		></canvas>
	</div>
	<div class="mt-3 flex gap-1.5">
		<label
			class={[
				'aspect-square h-auto w-full  bg-gradient-to-br from-white from-50% to-gray-300 to-50% ring transition-all',
				currentColor === -1 ? 'ring-2 ring-blue-800 dark:ring-blue-600' : 'ring-gray-400'
			]}
		>
			<input type="radio" bind:group={currentColor} value={-1} hidden />
		</label>
		{#each OdycColorsHEX as color, index (index)}
			<label
				class={[
					'aspect-square h-auto w-full  ring transition-all',
					index === currentColor ? 'ring-2 ring-blue-800 dark:ring-blue-600' : 'ring-gray-400'
				]}
				style="background-color: {color};"
			>
				<input type="radio" bind:group={currentColor} value={index} hidden />
			</label>
		{/each}
	</div>
</div>

{#if resize}
	<div class="flex w-full max-w-sm flex-col gap-1.5">
		<Label for="size">Size</Label>
		<div class="flex items-center gap-1">
			<Input
				onchange={handleChangeWidth}
				value={drawing.width}
				min="2"
				max="24"
				type="number"
				id="size"
				placeholder="8"
			/>
			<p class="text-muted-foreground font-light">x</p>
			<Input
				onchange={handleChangeHeight}
				value={drawing.height}
				min="2"
				max="24"
				type="number"
				id="size"
				placeholder="8"
			/>
		</div>
	</div>
{/if}
