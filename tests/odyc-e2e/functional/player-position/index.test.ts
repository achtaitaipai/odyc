import { expect, test } from 'vitest'
import { init } from './index'

test('player position can be set dynamically', async () => {
	const { game } = init()
	expect(game.player.position[0]).toBe(7)
	expect(game.player.position[1]).toBe(7)
})
