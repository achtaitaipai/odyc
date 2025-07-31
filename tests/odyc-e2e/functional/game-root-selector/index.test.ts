import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'

test('game canvases render inside an element', async () => {
	const div = document.createElement('div')
	div.id = 'game-root'
	document.body.appendChild(div)

	const { game, state } = init()

	const innerEl = document.querySelector('#game-root') as HTMLElement
	if (!innerEl) {
		throw new Error('Game root element not found.')
	}

	const rendererCanvasEl = document.querySelector(
		'#game-root .odyc-renderer-canvas',
	) as HTMLElement
	if (!rendererCanvasEl) {
		throw new Error('Game canvas element not found.')
	}

	const bodyLocator = page.elementLocator(document.body)
	const innerLocator = page.elementLocator(innerEl)

	await expect.element(bodyLocator).toContainElement(innerEl)
	await expect.element(innerLocator).toContainElement(rendererCanvasEl)
})
