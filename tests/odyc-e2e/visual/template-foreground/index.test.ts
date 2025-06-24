import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { assertEventuelly, registerImageSnapshot } from '../../helpers'

test('renders foreground templates above the player', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('sprite-in-foreground')
	})

	game.setCell(0, 0, { foreground: false })

	await assertEventuelly(async () => {
		const screenshot = await page.screenshot({ base64: true, save: false })
		await expect(screenshot).toMatchImageSnapshot('sprite-in-background')
	})
})
