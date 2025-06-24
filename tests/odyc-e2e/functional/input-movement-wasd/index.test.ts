import { expect, test } from 'vitest'
import { init } from './index'
import { userEvent } from '@vitest/browser/context'

test('player can move with WASD', async () => {
	const { game, state } = init()

	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	// Try each direction, ensure new position
	await userEvent.keyboard('[KeyD]')
	expect(game.player.position[0]).toBe(2)
	expect(game.player.position[1]).toBe(1)

	await userEvent.keyboard('[KeyA]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	await userEvent.keyboard('[KeyW]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(0)

	await userEvent.keyboard('[KeyS]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)
})
