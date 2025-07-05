<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import { IconTrash } from '@tabler/icons-svelte';
	import { createSoundFromTemplate, playSound, TEMPLATES } from 'pfxr';
	import { onMount } from 'svelte';

	import CopyBtn from './CopyBtn.svelte';

	type TemplateKey = keyof typeof TEMPLATES;
	type SoundData = {
		template: TemplateKey;
		name: string;
		seed: number;
	};

	const templatesKeys = Object.keys(TEMPLATES).filter((el) => el !== 'DEFAULT') as TemplateKey[];

	let audioCtx: AudioContext;
	let sounds: SoundData[] = $state([]);
	let selected: number | undefined = $state();

	onMount(() => {
		audioCtx = new AudioContext();
	});

	function createSound(template: TemplateKey) {
		const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		const nameSuffix =
			Math.max(
				0,
				...sounds
					.filter((el) => {
						const reg = new RegExp(`^${template} \\d+$`);
						return reg.test(el.name);
					})
					.map((el) => Number(el.name.match(/\d+/)))
			) + 1;
		const newSound = {
			template,
			seed,
			name: template + ' ' + nameSuffix
		};
		sounds = [newSound, ...sounds];
		selectAndPlay(0);
	}

	function remove(index: number) {
		sounds = sounds.filter((_, i) => i !== index);
		if (selected && selected > sounds.length) selected = 0;
		if (sounds.length <= 0) selected = undefined;
	}
	function play(index: number) {
		if (!audioCtx) return;
		const data = sounds[index];
		if (!data) return;
		const sound = createSoundFromTemplate(TEMPLATES[data.template], data.seed);
		playSound(sound, audioCtx, audioCtx.destination);
	}

	function selectAndPlay(index: number) {
		if (!sounds[index]) return;
		selected = index;
		play(selected);
	}
</script>

<div class="w-sm px-4 py-4">
	<ul
		class="soundsList | bg-base-200 flex h-40 flex-col overflow-auto border border-gray-200 py-2 dark:border-gray-800"
	>
		{#each sounds as sound, i}
			<li class={['flex', selected === i && 'bg-gray-100 font-bold dark:bg-gray-900']}>
				<button
					class={['grow cursor-pointer px-2 py-1 text-left text-sm']}
					onclick={() => selectAndPlay(i)}>{sound.name}</button
				>
				<CopyBtn toCopy="['{sound.template}', {sound.seed}]" />
				<Button size="icon" variant="ghost" onclick={() => remove(i)}>
					<IconTrash />
				</Button>
			</li>
		{/each}
	</ul>
	<div class="mt-4 flex flex-wrap gap-3">
		{#each templatesKeys as name}
			<Button variant="outline" onclick={() => createSound(name)}>{name}</Button>
		{/each}
	</div>
</div>

<style>
	.soundsList {
		scrollbar-gutter: stable;
	}
</style>
