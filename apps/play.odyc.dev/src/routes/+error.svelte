<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';

	function parseError(error: any): {
		title: string;
		description?: string;
	} {
		try {
			const json: any = JSON.parse(error);

			console.log(json);

			// Appwrite custom
			if (json.type) {
				console.info('ℹ️ Error type:', json.type);
				if (json.type === 'user_already_exists' || json.type === 'user_session_already_exists') {
					return {
						title: 'Your GitHub account is already linked to another Odyc Play account.',
						description:
							'Please sign out of your guest account, and sign in to your GitHub account afterwards.'
					};
				} else if (json.type === 'general_rate_limit_exceeded') {
					return {
						title: 'You are doing too many actions.',
						description: 'Please wait up to 1 hour, and try again later.'
					};
				}
			}

			// Appwrite default
			if (json.response) {
				try {
					const response = JSON.parse(json.response);
					if (response.message) {
						return { title: response.message };
					}
				} catch (err) {}
			}

			// SvelteKit
			if (json.text) {
				if (json.text === 'Not Found') {
					return {
						title: 'Sorry, this page does not exist',
						description: 'Please go back to homepage and try again later.'
					};
				}

				return { title: json.text };
			}

			// JS default
			if (json.message) {
				return { title: json.message };
			}

			return { title: error.toString ? error.toString() : error };
		} catch (_) {
			return { title: error.toString ? error.toString() : error };
		}
	}

	const err = parseError(page.error?.message);
</script>

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="w-full max-w-sm">
		<div class="flex flex-col gap-6">
			<div class="flex flex-col items-center justify-center gap-6">
				<div class="flex flex-col items-center gap-6">
					<a href="/" class="flex flex-col items-center gap-2 font-medium">
						<div class="flex items-center justify-center rounded-md">
							<img src="/logo.png" class="pixelated size-12" alt="Odyc.js Play Logo" />
						</div>
					</a>
					<h1 class="text-center text-xl font-bold">{err.title}</h1>
					{#if err.description}
						<div class="text-muted-foreground text-center text-sm">
							{err.description}
						</div>
					{/if}
				</div>

				<a href="/"><Button type="button" class="cursor-pointer">Back to homepage</Button></a>
			</div>
		</div>
	</div>
</div>
