import { expect, test, describe, vi } from 'vitest'
import { createGame } from 'odyc'
import { userEvent } from '@vitest/browser/context'

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

	test('should call onTurn for newly created actors on subsequent turns', async () => {
		const turnSpy = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onTurn() {
						game.setCellAt(1, 0, 'y')
					},
				},
				'.': {},
				y: {
					onTurn: turnSpy,
				},
			},
			map: `x.`,
		})

		// First turn - x creates y
		await userEvent.keyboard('[ArrowLeft]')
		expect(turnSpy).not.toHaveBeenCalled()

		// Second turn - y should have onTurn called
		await userEvent.keyboard('[ArrowLeft]')
		expect(turnSpy).toHaveBeenCalledOnce()
	})

	test('should not call onTurn for cells removed during the turn', async () => {
		const turnSpy = vi.fn()
		const game = createGame({
			templates: {
				x: {
					onCollide() {
						game.clearCellAt(0, 0)
					},
				},
				y: {
					onTurn: turnSpy,
				},
			},
			map: `yx`,
		})

		// Move right to collide with x, which clears y during the collision
		await userEvent.keyboard('[ArrowRight]')
		expect(turnSpy).not.toHaveBeenCalled()
	})
})
