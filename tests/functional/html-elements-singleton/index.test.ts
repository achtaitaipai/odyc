import { expect, test } from 'vitest'
import { init } from './index'

test('createGame does not create multiple htmlElements when called multiple times', async () => {
	init()
	const rendererCanvases = document.querySelectorAll('.odyc-renderer-canvas')
	expect(rendererCanvases.length).toBe(1)

	const dialogCanvases = document.querySelectorAll('.odyc-dialog-canvas')
	expect(dialogCanvases.length).toBe(1)

	const promptCanvases = document.querySelectorAll('.odyc-prompt-canvas')
	expect(promptCanvases.length).toBe(1)

	const messageCanvases = document.querySelectorAll('.odyc-message-canvas')
	expect(messageCanvases.length).toBe(1)

	const filterCanvases = document.querySelectorAll('.odyc-filter-canvas')
	expect(filterCanvases.length).toBe(1)

	const touchEventWrapper = document.querySelectorAll('.odyc-touch-event')
	expect(touchEventWrapper.length).toBe(1)
})
