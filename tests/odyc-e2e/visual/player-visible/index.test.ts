import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { assertEventuelly, registerImageSnapshot } from '../../helpers'

test('player is visible but can be invisible', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('player')
	})

	game.player.visible = false

	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('no-player')
	})

	game.player.visible = true

	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('player')
	})
})
