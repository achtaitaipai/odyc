import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('updateCells', () => {
	test('should update cells by symbol', () => {
		const { game } = init()

		// Initially wall cells should have sprite 1
		const wallCells = game.getCells({ symbol: '#' })
		expect(wallCells.length).toBe(6)
		expect(wallCells.every((cell) => cell.sprite === 1)).toBe(true)

		// Update all wall cells to have sprite 10
		game.updateCells({ symbol: '#' }, { sprite: '11' })

		// All wall cells should now have sprite 2
		const updatedWalls = game.getCells({ symbol: '#' })
		expect(updatedWalls.length).toBe(6)
		expect(updatedWalls.every((cell) => cell.sprite === '11')).toBe(true)
		expect(updatedWalls.every((cell) => cell.symbol === '#')).toBe(true) // symbol unchanged
	})

	test('should update cells by array of symbols', () => {
		const { game } = init()

		// Update both x and e cells
		game.updateCells(
			{ symbol: ['x', 'e'] },
			{ sprite: '11', dialog: 'Updated!' },
		)

		// Both types should be updated
		const xCells = game.getCells({ symbol: 'x' })
		const eCells = game.getCells({ symbol: 'e' })

		expect(
			xCells.every(
				(cell) => cell.sprite === '11' && cell.dialog === 'Updated!',
			),
		).toBe(true)
		expect(
			eCells.every(
				(cell) => cell.sprite === '11' && cell.dialog === 'Updated!',
			),
		).toBe(true)

		// Other cells should be unchanged
		const wallCells = game.getCells({ symbol: '#' })
		expect(wallCells.every((cell) => cell.sprite === 1)).toBe(true)
	})

	test('should update cells by property', () => {
		const { game } = init()

		// Update all solid cells
		game.updateCells({ solid: true }, { sprite: '11' })

		// All solid cells should have new sprite
		const solidCells = game.getCells({ solid: true })
		expect(solidCells.length).toBe(6)
		expect(solidCells.every((cell) => cell.sprite === '11')).toBe(true)
		expect(solidCells.every((cell) => cell.solid === true)).toBe(true) // property unchanged

		// Non-solid cells should be unchanged
		const nonSolidCells = game.getCells({ solid: false })
		expect(nonSolidCells.every((cell) => cell.sprite !== '11')).toBe(true)
	})

	test('should update cells by coordinate', () => {
		const { game } = init()

		// Update all cells in column 1
		game.updateCells({ x: 1 }, { sprite: '11', dialog: 'Column 1' })

		// All cells at x=1 should be updated
		const column1Cells = game.getCells({ x: 1 })
		expect(column1Cells.length).toBe(3)
		expect(column1Cells.every((cell) => cell.sprite === '11')).toBe(true)
		expect(column1Cells.every((cell) => cell.dialog === 'Column 1')).toBe(true)

		// Other columns should be unchanged
		const otherCells = game
			.getCells({})
			.filter((cell) => cell.position[0] !== 1)
		expect(otherCells.every((cell) => cell.sprite !== '11')).toBe(true)
	})

	test('should update cells by multiple conditions', () => {
		const { game } = init()

		// Update non-solid visible cells
		game.updateCells({ solid: false, visible: true }, { sprite: '11' })

		// Should update x, e, * cells but not o (invisible) or # (solid)
		expect(
			game.getCells({ symbol: 'x' }).every((cell) => cell.sprite === '11'),
		).toBe(true)
		expect(
			game.getCells({ symbol: 'e' }).every((cell) => cell.sprite === '11'),
		).toBe(true)
		expect(
			game.getCells({ symbol: '*' }).every((cell) => cell.sprite === '11'),
		).toBe(true)
		expect(
			game.getCells({ symbol: 'o' }).every((cell) => cell.sprite === 5),
		).toBe(true) // unchanged
		expect(
			game.getCells({ symbol: '#' }).every((cell) => cell.sprite === 1),
		).toBe(true) // unchanged
	})

	test('should handle empty query (update all cells)', () => {
		const { game } = init()

		// Update all cells
		game.updateCells({}, { dialog: 'Global update' })

		// All cells should have the new dialog
		const allCells = game.getCells({})
		expect(allCells.length).toBe(12)
		expect(allCells.every((cell) => cell.dialog === 'Global update')).toBe(true)
	})

	test('should handle query with no matches', () => {
		const { game } = init()

		// Try to update cells with non-existent symbol
		game.updateCells({ symbol: 'z' as any }, { sprite: '11' })

		// No cells should be affected
		const allCells = game.getCells({})
		expect(allCells.every((cell) => cell.sprite !== '11')).toBe(true)
	})

	test('should update specific cell by coordinates', () => {
		const { game } = init()

		// Get original cell at position
		const originalCell = game.getCellAt(1, 1)
		const originalSymbol = originalCell.symbol
		const originalPosition = originalCell.position

		// Update cell at specific position
		game.updateCells(
			{ x: 1, y: 1 },
			{ sprite: '11', dialog: 'Specific update' },
		)

		// Should have updated the cell at (1,1)
		const updatedCell = game.getCellAt(1, 1)
		expect(updatedCell.symbol).toBe(originalSymbol) // symbol unchanged
		expect(updatedCell.position).toEqual(originalPosition) // position unchanged
		expect(updatedCell.sprite).toBe('11')
		expect(updatedCell.dialog).toBe('Specific update')
	})

	test('should update multiple properties at once', () => {
		const { game } = init()

		// Update multiple properties of wall cells
		game.updateCells(
			{ symbol: '#' },
			{
				sprite: '11',
				dialog: 'Wall text',
				visible: false,
			},
		)

		// All wall cells should have all updated properties
		const wallCells = game.getCells({ symbol: '#' })
		expect(
			wallCells.every(
				(cell) =>
					cell.sprite === '11' &&
					cell.dialog === 'Wall text' &&
					cell.visible === false &&
					cell.solid === true, // original property preserved
			),
		).toBe(true)
	})

	test('should preserve properties not being updated', () => {
		const { game } = init()

		// Get original properties
		const originalCell = game.getCellAt(0, 0)
		const originalSolid = originalCell.solid
		const originalSymbol = originalCell.symbol

		// Update only sprite
		game.updateCells({ x: 0, y: 0 }, { sprite: '11' })

		// Should preserve other properties
		const updatedCell = game.getCellAt(0, 0)
		expect(updatedCell.sprite).toBe('11') // updated
		expect(updatedCell.solid).toBe(originalSolid) // preserved
		expect(updatedCell.symbol).toBe(originalSymbol) // preserved
	})
})
