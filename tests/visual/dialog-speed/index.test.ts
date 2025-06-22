import { expect, test } from 'vitest'
import { init } from './index'
import { page } from '@vitest/browser/context'
import { registerImageSnapshot } from '../../toMatchImageSnapshot'
import { userEvent } from '@vitest/browser/context'

test('player renders in correct size', async () => {
	registerImageSnapshot(expect)

	const { game, state } = init()
	
  let screenshot;

	screenshot = await page.screenshot({ base64: true, save: false })
  await expect(screenshot).toMatchImageSnapshot('empty');
  
  await userEvent.keyboard('[Space]')
  
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  screenshot = await page.screenshot({ base64: true, save: false })
  await expect(screenshot).toMatchImageSnapshot('half-message');
  
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  screenshot = await page.screenshot({ base64: true, save: false })
  await expect(screenshot).toMatchImageSnapshot('message');
  
})
