import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'

test('player is visible but can be invisible', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	let screenshot

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('player')

	game.player.visible = false

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('no-player')

	game.player.visible = true

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('player')
})
