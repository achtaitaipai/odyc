import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { globby } from 'globby'
import { fileURLToPath, URL } from 'node:url'

const pathes = await globby('games/*.html')
const getName = (path: string) => path.split('/').at(-1)!.replace('.html', '')

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(
					fileURLToPath(new URL('.', import.meta.url)),
					'index.html',
				),
				...pathes.reduce(
					(prev, curr) => ({
						...prev,
						[getName(curr)]: curr,
					}),
					{},
				),
			},
		},
	},
})
