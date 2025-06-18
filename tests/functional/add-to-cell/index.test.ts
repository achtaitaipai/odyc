import { expect, test } from 'vitest'
import { init } from './index'

test('add to cell', async () => {
	const { game, state } = init()
	expect(game.getCell(0, 0).symbol).toBe('.')
})
