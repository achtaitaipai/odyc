import { expect, test } from 'vitest'
import { init } from './index'
import { userEvent } from '@vitest/browser/context'

test('player can hit a wall', async () => {
	const { game, state } = init()

	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	// Hit wall, dont move
	await userEvent.keyboard('[ArrowUp]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	// Road, move successfully
	await userEvent.keyboard('[ArrowDown]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(2)
})
