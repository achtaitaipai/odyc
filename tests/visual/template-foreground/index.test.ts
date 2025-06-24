import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'

test('renders foreground templates above the player', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	const screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('init')
	game.setCell(0, 0, { foreground: true })
})
