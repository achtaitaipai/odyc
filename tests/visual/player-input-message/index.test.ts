import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'
import { userEvent } from '@vitest/browser/context'

test('message shows after input', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	let screenshot

	// Initial game state
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('game')

	// Wrong input, nothing changes
	await userEvent.keyboard('[ArrowDown]')
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('game')
	
	// Trigger message
	await userEvent.keyboard('[Space]')
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('message')
})
