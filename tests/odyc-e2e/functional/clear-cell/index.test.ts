import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('clear cell', () => {
	test('should remove actor from cell', () => {
		const { game } = init()
		expect(game.getCell(2, 0).symbol).toBe('x')

		game.clearCell(2, 0)
		expect(game.getCell(2, 0).symbol).toBeNull()
	})

	test('should not throw when clearing empty cell', () => {
		const { game } = init()
		expect(game.getCell(0, 0).symbol).toBeNull()

		expect(() => game.clearCell(0, 0)).not.toThrow()
	})
})
