import { page } from '@vitest/browser/context'
import { expect, test } from 'vitest'
import { createGame } from '../../../dist'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'

test('player renders in correct size', async () => {
	registerImageSnapshot(expect)

	let screenshot

	const game1 = createGame({ dialogSpeed: 'SLOW' })
	game1.openDialog('01234567890123456789012345678901234567890123456789')
	await new Promise((resolve) => setTimeout(resolve, 1000))
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('slow')

	const game2 = createGame({ dialogSpeed: 'NORMAL' })
	game2.openDialog('01234567890123456789012345678901234567890123456789')
	await new Promise((resolve) => setTimeout(resolve, 1000))
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('normal')

	const game3 = createGame({ dialogSpeed: 'FAST' })
	game3.openDialog('01234567890123456789012345678901234567890123456789')
	await new Promise((resolve) => setTimeout(resolve, 1000))
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('fast')
})
