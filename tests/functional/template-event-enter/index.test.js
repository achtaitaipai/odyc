import { expect, test } from 'vitest'
import { init } from './index.js'
import { createGame } from '../../../dist/index.js'
import { userEvent } from '@vitest/browser/context'

test('player can collect coins', async () => {
	const { game, state } = init(createGame)

	// Ensure starting point
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)

	// Collect only some (3) coins
	await userEvent.keyboard('[ArrowUp]')
	await userEvent.keyboard('[ArrowRight]')
	await userEvent.keyboard('[ArrowDown]')
	expect(state.balance).toBe(3)

	// Ensure coins were removed
	await userEvent.keyboard('[ArrowUp]')
	await userEvent.keyboard('[ArrowLeft]')
	await userEvent.keyboard('[ArrowDown]')
	expect(state.balance).toBe(3)

	// Ensure route taken is as expected
	expect(game.player.position[0]).toBe(1)
	expect(game.player.position[1]).toBe(1)
})
