<script lang="ts">
	let odycReady = $state(false);
	let stopAndSave = $state<any>(null);

	const { data } = $props();

	function sendScreenshot() {
		try {
			const canvasOutput = document.createElement('canvas')!;
			const ctx = canvasOutput.getContext('2d')!;

			const canvasIds = [
				'odyc-renderer-canvas',
				'odyc-dialog-canvas',
				'odyc-prompt-canvas',
				'odyc-filter-canvas',
				'odyc-message-canvas'
			];

			const allCanvases = canvasIds.map(
				(id) => document.querySelector<HTMLCanvasElement>('canvas.' + id)!
			);

			let maxSize = 0;
			allCanvases.forEach((canvas) => {
				maxSize = Math.max(maxSize, canvas?.width, canvas?.height);
			});

			const visibleFrames: HTMLCanvasElement[] = [];
			for (const canvas of allCanvases) {
				if (canvas && canvas.style.display !== 'none') {
					visibleFrames.push(canvas);
				}
			}

			if (visibleFrames.length === 0) {
				throw new Error('No visible canvas frames found for screenshot');
			}

			canvasOutput.width = maxSize;
			canvasOutput.height = maxSize;

			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, maxSize, maxSize);
			ctx.imageSmoothingEnabled = false;

			for (const canvas of visibleFrames) {
				const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
				const scaledWidth = canvas.width * scale;
				const scaledHeight = canvas.height * scale;

				const x = (maxSize - scaledWidth) / 2;
				const y = (maxSize - scaledHeight) / 2;

				ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
			}

			canvasOutput.toBlob((blob) => {
				window.parent.postMessage(
					{
						type: 'on-canvas-blob',
						detail: { blob }
					},
					'*'
				);
			});
		} catch (error) {
			console.error('Error sending screenshot:', error);
			window.parent.postMessage(
				{
					type: 'on-canvas-blob',
					detail: { blob: null }
				},
				'*'
			);
		}
	}

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
		} else if (type === 'onblobstart') {
			sendScreenshot();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.code) > -1) {
			event.preventDefault();
		}
	});

	window.parent.postMessage({ type: 'on-runner-ready' }, '*');
</script>

<svelte:head>
	<script defer src={`https://www.unpkg.com/odyc@${data.version}/dist/index.global.js`}></script>
</svelte:head>
