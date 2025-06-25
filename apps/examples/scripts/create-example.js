#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

/**
 * @param {string} name - The example name to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateName(name) {
	if (!name) {
		console.error('❌ Please provide an example name')
		return false
	}

	if (!/^[a-z0-9-]+$/.test(name)) {
		console.error(
			'❌ Name must contain only lowercase letters, numbers, and hyphens',
		)
		return false
	}

	return true
}

/**
 * @param {string} name - The example name
 * @returns {boolean} True if exists, false otherwise
 */
function exampleExists(name) {
	const htmlPath = join(projectRoot, 'games', `${name}.html`)
	const tsPath = join(projectRoot, 'src', name, 'index.ts')
	return existsSync(htmlPath) || existsSync(tsPath)
}

/**
 * @param {string} name - The example name
 * @returns {string} HTML template
 */
function createHtmlTemplate(name) {
	return `<!doctype html>
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
}

/**
 * @returns {string} TypeScript template
 */
function createTsTemplate() {
	return `import { createGame } from 'odyc'

const game = createGame({
	// Your game configuration here
})
`
}

/**
 * @param {string} name - The example name
 */
function createDirectories(name) {
	const tsDirPath = join(projectRoot, 'src', name)
	const gamesDirPath = join(projectRoot, 'games')

	mkdirSync(tsDirPath, { recursive: true })
	mkdirSync(gamesDirPath, { recursive: true })
}

/**
 * @param {string} name - The example name
 */
function updateIndexHtml(name) {
	const indexPath = join(projectRoot, 'index.html')

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
			console.log(`   <li><a href="/games/${name}.html">${name}</a></li>`)
		}
	} catch (error) {
		console.log('⚠️  Could not update index.html:', error.message)
	}
}

/**
 * @param {string} name - The example name
 */
function createFiles(name) {
	const htmlPath = join(projectRoot, 'games', `${name}.html`)
	const tsPath = join(projectRoot, 'src', name, 'index.ts')

	const htmlTemplate = createHtmlTemplate(name)
	const tsTemplate = createTsTemplate()

	writeFileSync(htmlPath, htmlTemplate)
	writeFileSync(tsPath, tsTemplate)

	console.log(`✅ Created example "${name}"`)
	console.log(`   📄 ${htmlPath}`)
	console.log(`   📝 ${tsPath}`)
}

/**
 * @returns {Promise<string>} The example name
 */
function promptForName() {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	return new Promise((resolve) => {
		const askName = () => {
			rl.question('Enter example name: ', (name) => {
				if (validateName(name)) {
					rl.close()
					resolve(name.trim())
				} else {
					askName()
				}
			})
		}
		askName()
	})
}

/**
 * @param {string} [name] - Optional name from command line
 */
async function createExample(name) {
	// If no name provided, prompt for it
	if (!name) {
		name = await promptForName()
	} else if (!validateName(name)) {
		console.log('Usage: npm run create-example [name]')
		process.exit(1)
	}

	// Check if example already exists
	if (exampleExists(name)) {
		console.error(`❌ Example "${name}" already exists`)
		process.exit(1)
	}

	// Create the example
	createDirectories(name)
	createFiles(name)
	updateIndexHtml(name)

	console.log('')
	console.log('🚀 Run "npm run dev" to start developing!')
}

// Get name from command line arguments or prompt user
const name = process.argv[2]
createExample(name)
