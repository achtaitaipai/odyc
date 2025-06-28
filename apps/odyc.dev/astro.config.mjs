// @ts-check
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import svelte from '@astrojs/svelte'
import { defaultLocale, locales } from '#i18n/index.ts'

// https://astro.build/config
export default defineConfig({
	i18n: {
		locales: [...locales],
		defaultLocale,
		fallback: {
			fr: 'en',
		},
		routing: {
			fallbackType: 'rewrite',
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [svelte()],
})
