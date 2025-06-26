import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('clearCells', () => {
	test('should clear cells by symbol', () => {
		const { game } = init()

		// Initially should have 6 wall cells
		expect(game.getCells({ symbol: '#' }).length).toBe(6)

		// Clear all wall cells
		game.clearCells({ symbol: '#' })

		// Should have no wall cells
		expect(game.getCells({ symbol: '#' }).length).toBe(0)
		// Other cells should remain
		expect(game.getCells({}).length).toBe(6) // x, e, *, o remain
	})

	test('should clear cells by array of symbols', () => {
		const { game } = init()

		// Initially should have 2 'x' and 2 'e' cells
		expect(game.getCells({ symbol: ['x', 'e'] }).length).toBe(4)

		// Clear both types
		game.clearCells({ symbol: ['x', 'e'] })

		// Should have no x or e cells
		expect(game.getCells({ symbol: ['x', 'e'] }).length).toBe(0)
		// Should have 8 remaining cells (#, *, o)
		expect(game.getCells({}).length).toBe(8)
	})

	test('should clear cells by property', () => {
		const { game } = init()

		// Initially should have 6 solid cells (all #)
		expect(game.getCells({ solid: true }).length).toBe(6)

		// Clear all solid cells
		game.clearCells({ solid: true })

		// Should have no solid cells
		expect(game.getCells({ solid: true }).length).toBe(0)
		// Should have 7 non-solid cells remaining
		expect(game.getCells({}).length).toBe(6)
	})

	test('should clear cells by coordinate', () => {
		const { game } = init()

		// Clear all cells in column 1
		game.clearCells({ x: 1 })

		// Should have no cells at x=1
		expect(game.getCells({ x: 1 }).length).toBe(0)
		// Should have 9 cells remaining (columns 0, 2, and 3)
		expect(game.getCells({}).length).toBe(9)
	})

	test('should clear cells by multiple conditions', () => {
		const { game } = init()

		// Clear non-solid cells that are visible
		game.clearCells({ solid: false, visible: true })

		// Should clear x, e, * cells but not o (invisible) or # (solid)
		expect(game.getCells({ symbol: 'x' }).length).toBe(0)
		expect(game.getCells({ symbol: 'e' }).length).toBe(0)
		expect(game.getCells({ symbol: '*' }).length).toBe(0)
		expect(game.getCells({ symbol: 'o' }).length).toBe(1) // invisible, kept
		expect(game.getCells({ symbol: '#' }).length).toBe(6) // solid, kept
	})

	test('should handle empty query (clear all cells)', () => {
		const { game } = init()

		// Initially should have 12 cells
		expect(game.getCells({}).length).toBe(12)

		// Clear all cells
		game.clearCells({})

		// Should have no cells
		expect(game.getCells({}).length).toBe(0)
	})

	test('should handle query with no matches', () => {
		const { game } = init()

		// Try to clear cells with non-existent symbol
		game.clearCells({ symbol: 'z' as any })

		// Should still have all 12 cells
		expect(game.getCells({}).length).toBe(12)
	})

	test('should clear specific cell by coordinates', () => {
		const { game } = init()

		// Clear cell at specific position
		game.clearCells({ x: 1, y: 1 })

		// Should have cleared the * cell at (1,1)
		expect(game.getCellAt(1, 1).symbol).toBe(null)
		// Should have 11 cells remaining
		expect(game.getCells({}).length).toBe(11)
	})
})
