import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { assertEventuelly, registerImageSnapshot } from '../../helpers'
import { userEvent } from '@vitest/browser/context'

test('message shows after input', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	// Initial game state
	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('game')
	})

	// Wrong input, nothing changes
	await userEvent.keyboard('[ArrowDown]')
	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('game')
	})

	// Trigger message
	await userEvent.keyboard('[Space]')
	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('message')
	})
})
