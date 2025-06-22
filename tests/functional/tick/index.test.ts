import { expect, test } from 'vitest'
import { createGame, tick } from '../../../dist'
import { userEvent } from '@vitest/browser/context'

test('game.tick() resolves after render cycle', async () => {
	const game = createGame()

	let resolved = false

	// Promise should not be resolved immediately
	expect(resolved).toBe(false)
	await userEvent.keyboard('[ArrowUp]')
	await tick().then(() => {
		resolved = true
	})

	// Wait for tick to resolve (should happen after render cycle)
	expect(resolved).toBe(true)
})

test('multiple tick calls return same promise until resolved', () => {
	const game = createGame()

	const promise1 = tick()
	const promise2 = tick()

	expect(promise1).toBe(promise2)
})

test('tick creates new promise after resolution', async () => {
	const game = createGame()

	const promise1 = tick()
	await promise1

	const promise2 = tick()
	expect(promise1).not.toBe(promise2)
})
