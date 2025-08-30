// @ts-check
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import { defaultLocale, locales } from '#lib/i18n/index.ts'

import expressiveCode from 'astro-expressive-code'

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

	integrations: [
		svelte(),
		expressiveCode({
			themes: ['min-light'],
			styleOverrides: {
				borderRadius: 'none',
				borderColor: 'var(--color-gray-200)',
				frames: {
					shadowColor: 'none',
				},
			},
		}),
	],
})
