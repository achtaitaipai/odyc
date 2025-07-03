import { createGame } from 'odyc'
import { expect, test, describe, vi } from 'vitest'

describe('sendMessageToCells', () => {
	test('onMessage should be called', () => {
		const spyFn = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onMessage: spyFn,
				},
			},
			map: 'x',
		})
		game.sendMessageToCells({ symbol: 'x' })
		expect(spyFn).toHaveBeenCalledOnce()
	})

	test('onMessage should be called for each cells mathing the query', () => {
		const spyFn = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onMessage: spyFn,
				},
			},
			map: 'xxxx',
		})
		game.sendMessageToCells({ symbol: 'x' })
		expect(spyFn).toHaveBeenCalledTimes(4)
	})

	test('onMessage should be called with the message as argument', () => {
		let savedMsg = ''
		const game = createGame({
			templates: {
				x: {
					onMessage(_, message) {
						savedMsg = message
					},
				},
			},
			map: 'x',
		})
		game.sendMessageToCells({ symbol: 'x' }, 'message')
		expect(savedMsg).toBe('message')
	})
})
