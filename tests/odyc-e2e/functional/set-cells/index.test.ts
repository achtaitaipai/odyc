import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('setCells', () => {
	test('should set cells by symbol', () => {
		const { game } = init()

		// Initially should have 6 wall cells
		expect(game.getCells({ symbol: '#' }).length).toBe(6)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)

		// Convert all wall cells to dots
		game.setCells({ symbol: '#' }, '.')

		// Should have no wall cells and 6 dot cells
		expect(game.getCells({ symbol: '#' }).length).toBe(0)
		expect(game.getCells({ symbol: '.' }).length).toBe(6)
	})

	test('should set cells by array of symbols', () => {
		const { game } = init()

		// Initially should have 2 'x' and 2 'e' cells
		expect(game.getCells({ symbol: ['x', 'e'] }).length).toBe(4)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)

		// Convert both types to dots
		game.setCells({ symbol: ['x', 'e'] }, '.')

		// Should have no x or e cells and 4 dot cells
		expect(game.getCells({ symbol: ['x', 'e'] }).length).toBe(0)
		expect(game.getCells({ symbol: '.' }).length).toBe(4)
	})

	test('should set cells by property', () => {
		const { game } = init()

		// Initially should have 6 solid cells (all #)
		expect(game.getCells({ solid: true }).length).toBe(6)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)

		// Convert all solid cells to dots
		game.setCells({ solid: true }, '.')

		// Should have no solid cells and 6 dot cells
		expect(game.getCells({ solid: true }).length).toBe(0)
		expect(game.getCells({ symbol: '.' }).length).toBe(6)
	})

	test('should set cells by coordinate', () => {
		const { game } = init()

		// Initially should have 3 cells in column 1
		expect(game.getCells({ x: 1 }).length).toBe(3)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)

		// Convert all cells in column 1 to dots
		game.setCells({ x: 1 }, '.')

		// Should have 3 dot cells
		expect(game.getCells({ symbol: '.' }).length).toBe(3)
		expect(game.getCells({ x: 1, symbol: '.' }).length).toBe(3)
	})

	test('should set cells by multiple conditions', () => {
		const { game } = init()

		// Convert non-solid cells that are visible to dots
		game.setCells({ solid: false, visible: true }, '.')

		// Should convert x, e, * cells but not o (invisible) or # (solid)
		expect(game.getCells({ symbol: 'x' }).length).toBe(0)
		expect(game.getCells({ symbol: 'e' }).length).toBe(0)
		expect(game.getCells({ symbol: '*' }).length).toBe(0)
		expect(game.getCells({ symbol: 'o' }).length).toBe(1) // invisible, kept
		expect(game.getCells({ symbol: '#' }).length).toBe(6) // solid, kept
		expect(game.getCells({ symbol: '.' }).length).toBe(5) // converted cells
	})

	test('should handle empty query (set all cells)', () => {
		const { game } = init()

		// Initially should have 12 cells
		expect(game.getCells({}).length).toBe(12)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)

		// Convert all cells to dots
		game.setCells({}, '.')

		// Should have 12 dot cells
		expect(game.getCells({ symbol: '.' }).length).toBe(12)
		expect(game.getCells({}).length).toBe(12)
	})

	test('should handle query with no matches', () => {
		const { game } = init()

		// Try to set cells with non-existent symbol
		game.setCells({ symbol: 'z' as any }, '.')

		// Should still have all original cells, no dots
		expect(game.getCells({}).length).toBe(12)
		expect(game.getCells({ symbol: '.' }).length).toBe(0)
	})

	test('should set specific cell by coordinates', () => {
		const { game } = init()

		// Get original cell at position
		const originalSymbol = game.getCellAt(1, 1).symbol
		expect(originalSymbol).toBe('*')

		// Convert cell at specific position to dot
		game.setCells({ x: 1, y: 1 }, '.')

		// Should have converted the * cell at (1,1) to dot
		expect(game.getCellAt(1, 1).symbol).toBe('.')
		expect(game.getCells({ symbol: '.' }).length).toBe(1)
		expect(game.getCells({ symbol: '*' }).length).toBe(0)
	})

	test('should preserve cell position when setting', () => {
		const { game } = init()

		// Get original position
		const originalCell = game.getCellAt(2, 0)
		const originalPosition = originalCell.position

		// Convert cell to dot
		game.setCells({ x: 2, y: 0 }, '.')

		// Should have same position but different symbol
		const newCell = game.getCellAt(2, 0)
		expect(newCell.position).toEqual(originalPosition)
		expect(newCell.symbol).toBe('.')
	})
})
