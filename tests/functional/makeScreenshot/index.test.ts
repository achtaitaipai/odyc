import { expect, it } from 'vitest'
import { createGame, makeScreenshot } from '../../../dist'

it('throws error if createGame is not called', () => {
	expect(() => makeScreenshot()).toThrow(
		'No visible canvas frames found for screenshot',
	)
})

it('creates instance with correct methods', () => {
	createGame()
	const screenshot = makeScreenshot()

	expect(screenshot).toBeDefined()
	expect(typeof screenshot.update).toBe('function')
	expect(typeof screenshot.save).toBe('function')
	expect(typeof screenshot.dataUrl).toBe('string')
})

it('dataUrl returns valid data URL', () => {
	createGame()
	const screenshot = makeScreenshot()
	const dataUrl = screenshot.dataUrl

	expect(dataUrl).toMatch(/^data:image\/png;base64,/)
	expect(dataUrl.length).toBeGreaterThan(100)
})

it('update method works', () => {
	createGame()
	const screenshot = makeScreenshot()

	expect(() => screenshot.update()).not.toThrow()

	const updatedDataUrl = screenshot.dataUrl
	expect(updatedDataUrl).toMatch(/^data:image\/png;base64,/)
})

it('save method exists and is callable', () => {
	createGame()
	const screenshot = makeScreenshot()

	expect(() => screenshot.save).not.toThrow()
	expect(typeof screenshot.save).toBe('function')
})
