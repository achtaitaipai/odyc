import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// SSR
		adapter: adapter()
		// Static
		// adapter: adapter({
		// 	pages: 'build',
		// 	assets: 'build',
		// 	fallback: 'index.html',
		// 	precompress: false,
		// 	strict: true
		// })
	}
};

export default config;
