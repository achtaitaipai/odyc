import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		retry: 5, // Temporary solution to flaky visual tests until they can await canvas render
		browser: {
			viewport: { height: 512, width: 512 },
			enabled: true,
			headless: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }],
		},
	},
})
