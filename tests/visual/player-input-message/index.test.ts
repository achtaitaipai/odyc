import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'
import { userEvent } from '@vitest/browser/context'
import { tick } from '../../../dist'

test('message shows after input', async () => {
	registerImageSnapshot(expect)

	let promise = tick()
	const { game, state } = init()
	await promise

	let screenshot

	// Initial game state
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('game')

	// Wrong input, nothing changes
	promise = tick()
	await userEvent.keyboard('[ArrowDown]')
	await promise
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('game')

	// Trigger message
	promise = tick()
	await userEvent.keyboard('[Space]')
	await promise
	screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('message')
})
