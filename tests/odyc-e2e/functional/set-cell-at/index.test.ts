import { expect, test } from 'vitest'
import { init } from './index'

test('set cell at', async () => {
	const { game, state } = init()
	expect(game.getCellAt(0, 0).symbol).toBe(null)
	game.setCellAt(0, 0, '.')
	expect(game.getCellAt(0, 0).symbol).toBe('.')
})
