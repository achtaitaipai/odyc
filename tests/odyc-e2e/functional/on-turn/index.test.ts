import { expect, test, describe, vi } from 'vitest'
import { init } from './index'
import { createGame, tick } from 'odyc'
import { userEvent } from '@vitest/browser/context'
import { sleep } from '../../helpers'

describe('onTurn events', () => {
	test('should call onTurn for existing actors only once per turn', async () => {
		const turnSpy = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onTurn: turnSpy,
				},
			},
			map: `x.`,
		})
		expect(turnSpy).not.toHaveBeenCalled()
		await userEvent.keyboard('[ArrowLeft]')
		expect(turnSpy).toHaveBeenCalled()
	})

	test('should not call onTurn for actors created during the same turn', async () => {
		const turnSpy = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onTurn() {
						game.addToCell(1, 0, 'y')
						turnSpy()
					},
				},
				'.': {},
				y: {
					onTurn: turnSpy,
				},
			},
			map: `x.`,
		})
		await userEvent.keyboard('[ArrowLeft]')
		expect(turnSpy).toHaveBeenCalledOnce()
	})

	// test('should call onTurn for newly created actors on subsequent turns', async () => {})
})
