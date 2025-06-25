import { expect, test } from 'vitest'
import { init } from './index'

test('update cell', async () => {
	const { game, state } = init()
	expect(game.getCellAt(0, 0).solid).toBe(true)
	game.updateCellAt(0, 0, { solid: false })
	expect(game.getCellAt(0, 0).solid).toBe(false)
})
