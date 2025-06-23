import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'
import { tick } from '../../../dist'

test('renders foreground templates above the player', async () => {
	registerImageSnapshot(expect)

	const promise = tick()
	const { game, state } = init()
	await promise

	const screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('init')
	game.setCell(0, 0, { foreground: true })
})
