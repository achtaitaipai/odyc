import { expect, test } from 'vitest'
import { init } from './index'

test('player can move', async () => {
	const { game, state } = init()
	expect(game.getCell(0, 0).symbol).toBe('.')
})
