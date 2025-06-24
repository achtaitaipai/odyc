#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

function createExample(name) {
	if (!name) {
		console.error('❌ Please provide an example name')
		console.log('Usage: npm run create-example <name>')
		process.exit(1)
	}

	// Validate name
	if (!/^[a-z0-9-]+$/.test(name)) {
		console.error(
			'❌ Name must contain only lowercase letters, numbers, and hyphens',
		)
		process.exit(1)
	}

	const htmlPath = join(projectRoot, 'games', `${name}.html`)
	const tsPath = join(projectRoot, 'src', name, 'index.ts')
	const tsDirPath = join(projectRoot, 'src', name)
	const indexPath = join(projectRoot, 'index.html')

	// Check if example already exists
	if (existsSync(htmlPath) || existsSync(tsPath)) {
		console.error(`❌ Example "${name}" already exists`)
		process.exit(1)
	}

	// HTML template
	const htmlTemplate = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" type="image/svg+xml" href="/vite.svg" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${name}</title>
	</head>
	<body>
		<script type="module" src="/src/${name}/index.ts"></script>
	</body>
</html>
`

	// TypeScript template
	const tsTemplate = `import { createGame } from 'odyc'

const game = createGame({
	// Your game configuration here
})
`

	// Create directories if they don't exist
	import('fs').then((fs) => {
		fs.mkdirSync(tsDirPath, { recursive: true })
		fs.mkdirSync(join(projectRoot, 'games'), { recursive: true })

		// Write files
		writeFileSync(htmlPath, htmlTemplate)
		writeFileSync(tsPath, tsTemplate)

		// Update index.html
		try {
			const indexContent = readFileSync(indexPath, 'utf-8')
			const listItemRegex = /(<ul[^>]*>)([\s\S]*?)(<\/ul>)/
			const match = indexContent.match(listItemRegex)

			if (match) {
				const [, openTag, listContent, closeTag] = match
				const newListItem = `\t\t\t<li><a href="/games/${name}.html">${name}</a></li>\n`
				const updatedContent = indexContent.replace(
					listItemRegex,
					`${openTag}${listContent}${newListItem}${closeTag}`,
				)
				writeFileSync(indexPath, updatedContent)
				console.log('✅ Updated index.html')
			} else {
				console.log(
					'⚠️  Could not automatically update index.html - please add manually:',
				)
				console.log(`   <li><a href="/games/${name}/">${name}</a></li>`)
			}
		} catch (error) {
			console.log('⚠️  Could not update index.html:', error.message)
		}

		console.log(`✅ Created example "${name}"`)
		console.log(`   📄 ${htmlPath}`)
		console.log(`   📝 ${tsPath}`)
		console.log('')
		console.log('🚀 Run "npm run dev" to start developing!')
	})
}

// Get name from command line arguments
const name = process.argv[2]
createExample(name)

