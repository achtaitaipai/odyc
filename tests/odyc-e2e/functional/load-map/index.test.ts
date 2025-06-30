import { describe, expect, test } from 'vitest'
import { init } from './index.js'

describe('loadMap', () => {
	test('should load new map and update game dimensions', () => {
		const { game } = init()

		// Initial state check
		expect(game.width).toBe(3)
		expect(game.height).toBe(3)
		expect(game.getCells({}).length).toBe(9)

		// Load new map
		const newMap = `
			#####
			#...#
			#.x.#
			#...#
			#####
		`
		game.loadMap(newMap)

		// Check new dimensions
		expect(game.width).toBe(5)
		expect(game.height).toBe(5)
		expect(game.getCells({}).length).toBe(25)

		// Check specific cells
		const walls = game.getCells({ symbol: '#' })
		const dots = game.getCells({ symbol: '.' })
		const x = game.getCells({ symbol: 'x' })

		expect(walls.length).toBe(16) // Perimeter walls
		expect(dots.length).toBe(8) // Inner empty spaces
		expect(x.length).toBe(1) // Single X in center
	})

	test('should load new map and update player position when specified', () => {
		const { game } = init()

		// Initial player position
		expect(game.player.position).toEqual([1, 1])

		// Load new map with new player position
		const newMap = `
			#######
			#.....#
			#.....#
			#.....#
			#######
		`
		game.loadMap(newMap, [3, 2])

		// Check player moved to new position
		expect(game.player.position).toEqual([3, 2])
		expect(game.width).toBe(7)
		expect(game.height).toBe(5)
	})

	test('should load new map without changing player position when not specified', () => {
		const { game } = init()

		// Initial player position
		expect(game.player.position).toEqual([1, 1])

		// Load new map without specifying player position
		const newMap = `
			####
			#..#
			#..#
			####
		`
		game.loadMap(newMap)

		// Player position should remain the same
		expect(game.player.position).toEqual([1, 1])
		expect(game.width).toBe(4)
		expect(game.height).toBe(4)
	})

	test('should handle different map symbols correctly', () => {
		const { game } = init()

		const newMap = `
			##x##
			#...#
			o...o
			#...#
			##x##
		`
		game.loadMap(newMap)

		// Check all symbol types are loaded correctly
		const walls = game.getCells({ symbol: '#' })
		const dots = game.getCells({ symbol: '.' })
		const x = game.getCells({ symbol: 'x' })
		const o = game.getCells({ symbol: 'o' })

		expect(walls.length).toBe(12)
		expect(dots.length).toBe(9)
		expect(x.length).toBe(2)
		expect(o.length).toBe(2)

		// Verify specific positions
		const xCells = game.getCells({ symbol: 'x' })
		expect(
			xCells.some((cell) => cell.position[0] === 2 && cell.position[1] === 0),
		).toBe(true)
		expect(
			xCells.some((cell) => cell.position[0] === 2 && cell.position[1] === 4),
		).toBe(true)
	})

	test('should preserve templates when loading new map', () => {
		const { game } = init()

		// Check initial template properties
		const initialWall = game.getCellAt(0, 0)
		expect(initialWall.solid).toBe(true)
		expect(initialWall.sprite).toBe(1)

		// Load new map
		const newMap = `
			####
			#..#
			#x.#
			####
		`
		game.loadMap(newMap)

		// Check that templates are still applied correctly
		const walls = game.getCells({ symbol: '#' })
		const dots = game.getCells({ symbol: '.' })
		const x = game.getCells({ symbol: 'x' })

		// All walls should still be solid with sprite 1
		expect(walls.every((cell) => cell.solid === true)).toBe(true)
		expect(walls.every((cell) => cell.sprite === 1)).toBe(true)

		// All dots should still be non-solid with sprite 2
		expect(dots.every((cell) => cell.solid === false)).toBe(true)
		expect(dots.every((cell) => cell.sprite === 2)).toBe(true)

		// X should have correct template properties
		expect(x[0]?.solid).toBe(false)
		expect(x[0]?.sprite).toBe(3)
	})

	test('should handle map with different layouts', () => {
		const { game } = init()

		const newMap = `####
                    #..#
                    #..#
                    ####`
		game.loadMap(newMap)

		expect(game.width).toBe(4)
		expect(game.height).toBe(4)

		// Check that dots are in the center
		const dots = game.getCells({ symbol: '.' })
		expect(dots.length).toBe(4) // 2x2 center area

		// Check walls around perimeter
		const walls = game.getCells({ symbol: '#' })
		expect(walls.length).toBe(12) // Perimeter walls

		// Verify specific positions
		expect(game.getCellAt(1, 1).symbol).toBe('.')
		expect(game.getCellAt(2, 1).symbol).toBe('.')
		expect(game.getCellAt(1, 2).symbol).toBe('.')
		expect(game.getCellAt(2, 2).symbol).toBe('.')
	})

	test('should save player state after loading map', () => {
		const { game } = init()

		// Move player first
		game.player.position = [2, 2]

		// Load new map with new position
		const newMap = `
			#####
			#...#
			#...#
			#...#
			#####
		`
		game.loadMap(newMap, [1, 1])

		// Player position should be updated and state saved
		expect(game.player.position).toEqual([1, 1])

		// The loadMap function calls saveCurrentState() internally
		// This ensures the player's new position is properly saved
	})
})

