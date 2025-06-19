import { expect, test } from 'vitest'
import { init } from './index'
import { userEvent } from '@vitest/browser/context'

test('createGame does not create multiple InputsHandler when called multiple times', async () => {
	const { state } = init()

	const inputsElement = document.querySelectorAll('.odyc-touchEvent')
	expect(inputsElement.length).toBe(1)

	expect(state.call).toBe(0)

	await userEvent.keyboard('[ArrowRight]')
	expect(state.call).toBe(1)
})
