import { defineConfig } from 'tsup'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

function getGitHash() {
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
	} catch {
		return 'unknown'
	}
}

function getPackageVersion() {
	try {
		const packageJson = JSON.parse(
			readFileSync(join(__dirname, 'package.json'), 'utf8'),
		)
		return packageJson.version
	} catch {
		return 'unknown'
	}
}

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
	define: {
		__GIT_HASH__: JSON.stringify(getGitHash()),
		__PACKAGE_VERSION__: JSON.stringify(getPackageVersion()),
	},
})
