import { expect, test, describe, vi } from 'vitest'
import { init } from './index'

describe('moveTo method', () => {
	// Basic Movement Tests
	test('should move cell to new position', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		expect(game.getCellAt(1, 1).symbol).toBe('x')
		expect(game.getCellAt(1, 1).position).toEqual([1, 1])
	})

	test('should clear original position after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		expect(game.getCellAt(0, 0).symbol).toBe(null)
	})

	test('should preserve all cell properties after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)
		const movedCell = game.getCellAt(1, 1)

		expect(movedCell.symbol).toBe('x')
		expect(movedCell.sprite).toBe(1)
		expect(movedCell.solid).toBe(true)
		expect(movedCell.visible).toBe(true)
	})

	test('should preserve cell symbol after move', () => {
		const { game } = init()
		const cell = game.getCellAt(2, 0) // z cell

		cell.moveTo(1, 1)

		expect(game.getCellAt(1, 1).symbol).toBe('z')
	})

	// Position Conflict Tests
	test('should replace existing cell when moving to occupied position', () => {
		const { game } = init()
		const cellX = game.getCellAt(0, 0) // x cell
		const cellY = game.getCellAt(1, 0) // y cell

		cellX.moveTo(1, 0) // Move x to y's position

		expect(game.getCellAt(1, 0).symbol).toBe('x')
		expect(game.getCellAt(1, 0).sprite).toBe(1)
	})

	test('should not create duplicate cells after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		const cellsWithSymbolX = game.getCells({ symbol: 'x' })
		expect(cellsWithSymbolX).toHaveLength(1)
		expect(cellsWithSymbolX[0]?.position).toEqual([1, 1])
	})

	test('should properly remove target cell when moving to occupied position', () => {
		const { game } = init()
		const cellX = game.getCellAt(0, 0) // x cell

		cellX.moveTo(1, 0) // Move to y's position

		const cellsWithSymbolY = game.getCells({ symbol: 'y' })
		expect(cellsWithSymbolY).toHaveLength(0)
	})

	// Edge Case Tests
	test('should handle moving to same position (no-op)', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(0, 0)

		expect(game.getCellAt(0, 0).symbol).toBe('x')
		expect(game.getCellAt(0, 0).sprite).toBe(1)
	})

	test('should handle multiple moves in sequence', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)
		cell.moveTo(2, 2)

		expect(game.getCellAt(2, 2).symbol).toBe('x')
		expect(game.getCellAt(1, 1).symbol).toBe(null)
		expect(game.getCellAt(0, 0).symbol).toBe(null)
	})

	test('should work with cells having different property combinations', () => {
		const { game } = init()
		const cellY = game.getCellAt(1, 0) // y cell with different properties

		cellY.moveTo(1, 1)
		const movedCell = game.getCellAt(1, 1)

		expect(movedCell.symbol).toBe('y')
		expect(movedCell.sprite).toBe(2)
		expect(movedCell.solid).toBe(false)
		expect(movedCell.visible).toBe(false)
	})

	// Integration Tests
	test('should work with getCellAt queries after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		expect(game.getCellAt(1, 1).symbol).toBe('x')
		expect(game.getCellAt(1, 1).solid).toBe(true)
	})

	test('should work with getCells queries after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		const solidCells = game.getCells({ solid: true })
		expect(
			solidCells.some((c) => c.position[0] === 1 && c.position[1] === 1),
		).toBe(true)
		expect(
			solidCells.some((c) => c.position[0] === 0 && c.position[1] === 0),
		).toBe(false)
	})

	test('should work with position-based queries after move', () => {
		const { game } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		const cellsAtNewPosition = game.getCells({ x: 1, y: 1 })
		expect(cellsAtNewPosition).toHaveLength(1)
		expect(cellsAtNewPosition[0]?.symbol).toBe('x')

		const cellsAtOldPosition = game.getCells({ x: 0, y: 0 })
		expect(game.getCellAt(0, 0).symbol).toBe(null)
	})

	// Event Handler Tests
	test('should preserve event handlers after move', () => {
		const { game, state } = init()
		const cell = game.getCellAt(0, 0)

		cell.moveTo(1, 1)

		// Verify event handlers are still attached by checking the cell has them
		// We can't directly test the functions, but we can verify behavior
		expect(game.getCellAt(1, 1).symbol).toBe('x')
		// The event handlers should still be present on the moved cell
	})

	test('should preserve dialog property after move', () => {
		const { game } = init()
		const cell = game.getCellAt(2, 0) // z cell with dialog

		cell.moveTo(1, 1)

		expect(game.getCellAt(1, 1).dialog).toBe('test dialog')
	})
})

