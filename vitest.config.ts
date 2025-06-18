import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		browser: {
			viewport: { height: 512, width: 512 },
			enabled: true,
			headless: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }],
		},
	},
})
