<script lang="ts">
	let odycReady = $state(false);
	let stopAndSave = $state<any>(null);

	function evalCode(code: string) {
		if (!odycReady) {
			try {
				// @ts-expect-error Purpose of try/catch is to check if this variable exists
				odyc;
				// @ts-expect-error Override untyped global method
				window.createGame = odyc.createGame;
				// @ts-expect-error Override untyped global method
				window.createSound = odyc.createSound;
				// @ts-expect-error Override untyped global method
				window.charToSprite = odyc.charToSprite;
				// @ts-expect-error Override untyped global method
				window.vec2 = odyc.vec2;
				// @ts-expect-error Override untyped global method
				window.tick = odyc.tick;
				// @ts-expect-error Override untyped global method
				window.mergeSprites = odyc.mergeSprites;

				odycReady = true;
			} catch {
				setTimeout(() => {
					evalCode(code);
				}, 32);
				return;
			}
		}

		eval(code);
	}

	window.addEventListener('message', (event: any) => {
		const { type, detail } = event.data;
		if (type === 'oncodechange') {
			const code = detail.code;
			evalCode(code);
		} else if (type === 'onscreenshot') {
			// @ts-expect-error odyc class is ensured during evalCode()
			odyc.makeScreenshot('odyc-play-screenshot');
		} else if (type === 'onrecordingstart') {
			// @ts-expect-error odyc class is ensured during evalCode()
			stopAndSave = odyc.startRecording();
		} else if (type === 'onrecordingend') {
			stopAndSave('odyc-play-recording');
		}
	});

	window.parent.postMessage('on-runner-ready', '*');
</script>

<svelte:head>
	<script defer src="https://www.unpkg.com/odyc@latest/dist/index.global.js"></script>
	<style>
		.odyc-touchEvent {
			display: none !important;
		}
	</style>
</svelte:head>
