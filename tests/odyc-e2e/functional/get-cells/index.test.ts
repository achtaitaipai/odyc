import { expect, test, describe } from 'vitest'
import { init } from './index'

describe('getCells', () => {
	test('should return all cells when no query provided', () => {
		const { game } = init()
		const allCells = game.getCells({})
		expect(allCells.length).toBe(9)
	})

	test('should filter cells by symbol', () => {
		const { game } = init()
		const wallCells = game.getCells({ symbol: '#' })
		expect(wallCells.length).toBe(3)
		expect(wallCells.every((cell) => cell.symbol === '#')).toBe(true)
	})

	test('should filter cells by array of symbols', () => {
		const { game } = init()
		const multiSymbolCells = game.getCells({ symbol: ['#', 'x'] })
		expect(multiSymbolCells.length).toBe(4)
		expect(
			multiSymbolCells.every(
				(cell) => cell.symbol === '#' || cell.symbol === 'x',
			),
		).toBe(true)

		const twoSymbolCells = game.getCells({ symbol: ['e', '*'] })
		expect(twoSymbolCells.length).toBe(2) // 1 'e' cell + 1 '*' cell
		expect(
			twoSymbolCells.every(
				(cell) => cell.symbol === 'e' || cell.symbol === '*',
			),
		).toBe(true)
	})

	test('should filter cells by array of symbols with single element', () => {
		const { game } = init()
		const singleSymbolArray = game.getCells({ symbol: ['o'] })
		expect(singleSymbolArray.length).toBe(1)
		expect(singleSymbolArray[0]?.symbol).toBe('o')
	})

	test('should return empty array for array of non-existent symbols', () => {
		const { game } = init()
		const nonExistentSymbols = game.getCells({ symbol: ['z', 'q' as any] })
		expect(nonExistentSymbols).toEqual([])
	})

	test('should filter cells by solid property', () => {
		const { game } = init()
		const solidCells = game.getCells({ solid: true })
		expect(solidCells.length).toBe(3) // All # cells are solid
		expect(solidCells.every((cell) => cell.solid === true)).toBe(true)

		const nonSolidCells = game.getCells({ solid: false })
		expect(nonSolidCells.length).toBe(6) // x, e, *, o, a, b cells
		expect(nonSolidCells.every((cell) => cell.solid === false)).toBe(true)
	})

	test('should filter cells by sprite', () => {
		const { game } = init()
		const sprite1Cells = game.getCells({ sprite: 1 })
		expect(sprite1Cells.length).toBe(3) // All # cells have sprite 1
		expect(sprite1Cells.every((cell) => cell.sprite === 1)).toBe(true)
	})

	test('should filter cells by x coordinate', () => {
		const { game } = init()
		const cellsAtX1 = game.getCells({ x: 1 })
		expect(cellsAtX1.length).toBe(3) // Column 1: x, *, a
		expect(cellsAtX1.every((cell) => cell.position[0] === 1)).toBe(true)
	})

	test('should filter cells by y coordinate', () => {
		const { game } = init()
		const cellsAtY1 = game.getCells({ y: 1 })
		expect(cellsAtY1.length).toBe(3) // Row 1: e, *, o
		expect(cellsAtY1.every((cell) => cell.position[1] === 1)).toBe(true)
	})

	test('should filter cells by x and y coordinates', () => {
		const { game } = init()
		const cellAtXY = game.getCells({ x: 1, y: 1 })
		expect(cellAtXY.length).toBe(1)
		expect(cellAtXY[0]?.position).toEqual([1, 1])
		expect(cellAtXY[0]?.symbol).toBe('*')
	})

	test('should filter cells by dialog', () => {
		const { game } = init()
		const dialogCells = game.getCells({ dialog: 'Hello!' })
		expect(dialogCells.length).toBe(1)
		expect(dialogCells[0]?.symbol).toBe('x')
		expect(dialogCells[0]?.dialog).toBe('Hello!')
	})

	test('should filter cells by end property', () => {
		const { game } = init()
		const endCells = game.getCells({ end: 'Game Over' })
		expect(endCells.length).toBe(1)
		expect(endCells[0]?.symbol).toBe('e')
		expect(endCells[0]?.end).toBe('Game Over')
	})

	test('should filter cells by end array property', () => {
		const { game } = init()
		const endArrayCells = game.getCells({ end: ['win', 'victory'] })
		expect(endArrayCells.length).toBe(1)
		expect(endArrayCells[0]?.symbol).toBe('a')
		expect(endArrayCells[0]?.end).toEqual(['win', 'victory'])
	})

	test('should filter cells by single element end array', () => {
		const { game } = init()
		const singleEndArrayCells = game.getCells({ end: ['lose'] })
		expect(singleEndArrayCells.length).toBe(1)
		expect(singleEndArrayCells[0]?.symbol).toBe('b')
		expect(singleEndArrayCells[0]?.end).toEqual(['lose'])
	})

	test('should not match different types of end values', () => {
		const { game } = init()
		// String query should not match array end values
		const stringQueryForArray = game.getCells({ end: 'win' })
		expect(stringQueryForArray.length).toBe(0)

		// Array query should not match string end values
		const arrayQueryForString = game.getCells({ end: ['Game Over'] })
		expect(arrayQueryForString.length).toBe(0)
	})

	test('should not match arrays with different content', () => {
		const { game } = init()
		const differentArrayQuery = game.getCells({ end: ['win', 'lose'] })
		expect(differentArrayQuery.length).toBe(0)

		const differentOrderQuery = game.getCells({ end: ['victory', 'win'] })
		expect(differentOrderQuery.length).toBe(0)
	})

	test('should not match partial array matches', () => {
		const { game } = init()
		const partialMatch = game.getCells({ end: ['win'] })
		expect(partialMatch.length).toBe(0)

		const extraElementsMatch = game.getCells({
			end: ['win', 'victory', 'extra'],
		})
		expect(extraElementsMatch.length).toBe(0)
	})

	test('should filter cells by foreground property', () => {
		const { game } = init()
		const foregroundCells = game.getCells({ foreground: true })
		expect(foregroundCells.length).toBe(1)
		expect(foregroundCells[0]?.symbol).toBe('*')
		expect(foregroundCells[0]?.foreground).toBe(true)
	})

	test('should filter cells by visible property', () => {
		const { game } = init()
		const invisibleCells = game.getCells({ visible: false })
		expect(invisibleCells.length).toBe(1)
		expect(invisibleCells[0]?.symbol).toBe('o')
		expect(invisibleCells[0]?.visible).toBe(false)
	})

	test('should support multiple query conditions', () => {
		const { game } = init()
		const solidSprite1Cells = game.getCells({ solid: true, sprite: 1 })
		expect(solidSprite1Cells.length).toBe(3) // All # cells
		expect(
			solidSprite1Cells.every(
				(cell) => cell.solid === true && cell.sprite === 1,
			),
		).toBe(true)

		const nonSolidForegroundCells = game.getCells({
			solid: false,
			foreground: true,
		})
		expect(nonSolidForegroundCells.length).toBe(1) // Only * cell
		expect(nonSolidForegroundCells[0]?.symbol).toBe('*')
	})

	test('should return empty array when no cells match query', () => {
		const { game } = init()
		const nonExistentCells = game.getCells({ symbol: '#', solid: false })
		expect(nonExistentCells).toEqual([])

		const impossibleCombination = game.getCells({
			solid: true,
			foreground: true,
		})
		expect(impossibleCombination).toEqual([])
	})

	test('should return CellFacade instances', () => {
		const { game } = init()
		const cells = game.getCells({ symbol: '#' })
		expect(cells.length).toBeGreaterThan(0)

		// Test that returned objects have CellFacade methods/properties
		const firstCell = cells[0]
		expect(typeof firstCell?.symbol).toBe('string')
		expect(typeof firstCell?.solid).toBe('boolean')
		expect(typeof firstCell?.remove).toBe('function')
		expect(Array.isArray(firstCell?.position)).toBe(true)
	})
})
