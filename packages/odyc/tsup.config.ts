import { defineConfig } from 'tsup'

export default defineConfig({
	dts: true, // Generate .d.ts files
	minify: true, // Minify output
	treeshake: true, // Remove unused code
	splitting: true, // Split output into chunks
	clean: true, // Clean output directory before building
	outDir: 'dist', // Output directory
	entry: ['src/index.ts'], // Entry point(s)
	format: ['esm', 'iife'], // Output format(s)
	globalName: 'odyc',
	injectStyle: true,
	loader: {
		'.glsl': 'text',
	},
})
