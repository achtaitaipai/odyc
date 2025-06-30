<script lang="ts">
	let odycReady = $state(false);

	function evalCode(code: string) {
		if (!odycReady) {
			try {
				// @ts-expect-error Purpose of try/catch is to check if this variable exists
				odyc;
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
