import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../helpers'

test('template is not rendered when visible is false', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()

	const screenshot = await page.screenshot({ base64: true, save: false })
	await expect(screenshot).toMatchImageSnapshot('init')
})
