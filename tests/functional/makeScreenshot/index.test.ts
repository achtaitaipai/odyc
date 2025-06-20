import { expect, test } from 'vitest'
import { makeScreenshot } from '../../../dist'

test('creates instance with correct methods', () => {
	const screenshot = makeScreenshot()

	expect(screenshot).toBeDefined()
	expect(typeof screenshot.update).toBe('function')
	expect(typeof screenshot.save).toBe('function')
	expect(typeof screenshot.dataUrl).toBe('string')
})

test('dataUrl returns valid data URL', () => {
	const screenshot = makeScreenshot()
	const dataUrl = screenshot.dataUrl

	expect(dataUrl).toMatch(/^data:image\/png;base64,/)
	expect(dataUrl.length).toBeGreaterThan(100)
})

test('update method works', () => {
	const screenshot = makeScreenshot()

	expect(() => screenshot.update()).not.toThrow()

	const updatedDataUrl = screenshot.dataUrl
	expect(updatedDataUrl).toMatch(/^data:image\/png;base64,/)
})

test('save method exists and is callable', () => {
	const screenshot = makeScreenshot()

	expect(() => screenshot.save).not.toThrow()
	expect(typeof screenshot.save).toBe('function')
})

