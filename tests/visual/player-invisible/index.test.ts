import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'
import { tick } from '../../../dist/index'

test('player is invisible but can be visible', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	let screenshot
	let promise

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('no-player')

	promise = tick()
	game.player.visible = true
	await promise

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('player')

	promise = tick()
	game.player.visible = false
	await promise

	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('no-player')
})
