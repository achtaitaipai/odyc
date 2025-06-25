import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('clear cell', () => {
	test('should remove actor from cell', () => {
		const { game } = init()
		expect(game.getCellAt(2, 0).symbol).toBe('x')

		game.clearCellAt(2, 0)
		expect(game.getCellAt(2, 0).symbol).toBeNull()
	})

	test('should not throw when clearing empty cell', () => {
		const { game } = init()
		expect(game.getCellAt(0, 0).symbol).toBeNull()

		expect(() => game.clearCellAt(0, 0)).not.toThrow()
	})
})
