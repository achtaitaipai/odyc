import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		browser: {
			viewport: { height: 500, width: 500 },
			enabled: true,
			headless: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }],
		},
	},
})
