import { expect, it } from 'vitest'
import { createGame, makeScreenshot } from '../../../dist'

it('throws error if createGame is not called', () => {
	expect(() => makeScreenshot('test')).toThrow(
		'No visible canvas frames found for screenshot',
	)
})

it('executes without errors when game is created', () => {
	createGame()
	expect(() => makeScreenshot('test')).not.toThrow()
})
