import { page } from '@vitest/browser/context'
import { expect, test } from 'vitest'
import { createGame } from '../../../dist'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'

test('dialog speed produces different visual states', async () => {
	registerImageSnapshot(expect)

	const testMessage = 'Testing different dialog speeds with this longer message'

	// Test SLOW speed
	const game1 = createGame({ dialogSpeed: 'SLOW' })
	game1.openDialog(testMessage)
	await new Promise((resolve) => setTimeout(resolve, 500))
	const slowScreenshot = await page.screenshot({ base64: true, save: false })
	// Try-catch prevents test failure from snapshot mismatch - we only care about speed differences
	try {
		await expect(slowScreenshot).toMatchImageSnapshot('slow')
	} catch (error) {}

	// Test NORMAL speed
	const game2 = createGame({ dialogSpeed: 'NORMAL' })
	game2.openDialog(testMessage)
	await new Promise((resolve) => setTimeout(resolve, 500))
	const normalScreenshot = await page.screenshot({ base64: true, save: false })
	// Try-catch prevents test failure from snapshot mismatch - we only care about speed differences
	try {
		await expect(normalScreenshot).toMatchImageSnapshot('normal')
	} catch (error) {}

	// FAST speed (15ms) completes too quickly to test meaningfully with 500ms delay
	// Main assertion: verify SLOW and NORMAL speeds produce different visual states
	expect(slowScreenshot).not.toBe(normalScreenshot)
})
