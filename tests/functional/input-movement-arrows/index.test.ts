import { expect, test } from 'vitest'
import { init } from './index'
import { userEvent } from '@vitest/browser/context'

test('player can move with arrows', async () => {
	const { game, state } = init()

	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	// Try each direction, ensure new position
	await userEvent.keyboard('[ArrowRight]')
	expect(game.player.position[0]).toBe(2)
	expect(game.player.position[1]).toBe(1)

	await userEvent.keyboard('[ArrowLeft]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	await userEvent.keyboard('[ArrowUp]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(0)

	await userEvent.keyboard('[ArrowDown]')
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)
})
