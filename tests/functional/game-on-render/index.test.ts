import { expect, test } from 'vitest'
import { init } from './index'
import { userEvent } from '@vitest/browser/context'

test('player can move with arrows', async () => {
	const { game, state } = init()

	let ticks = 0
	game.onRender(() => {
		ticks++
	})

	expect(ticks).toBe(0)

	game.player.position[0] = 0
	game.player.position[1] = 2

	await new Promise((resolve) => setTimeout(resolve, 500))

	expect(ticks).toBe(2)
})
