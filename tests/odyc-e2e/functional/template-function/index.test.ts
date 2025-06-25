import { expect, test } from 'vitest'
import { init } from './index'

test('template functions receive position parameter', () => {
	const { game, receivedPositions } = init()

	expect(receivedPositions).toEqual([
		[0, 0], // First dot
		[2, 0], // Second dot
		[1, 1], // Middle dot
		[0, 2], // Bottom left dot
		[2, 2], // Bottom right dot
	])
})

test('template functions receive correct position when using setCellAt', () => {
	const { game, receivedPositions } = init()

	// Clear previous positions
	receivedPositions.length = 0

	// Add a new cell using setCellAt
	game.setCellAt(5, 3, '.')

	// Should have received the position
	expect(receivedPositions).toEqual([[5, 3]])

	// Verify the cell was created at the right position
	const cell = game.getCellAt(5, 3)
	expect(cell.symbol).toBe('.')
	expect(cell.position).toEqual([5, 3])
})

test('template functions called multiple times for same position', () => {
	const { game, receivedPositions } = init()

	// Clear previous positions
	receivedPositions.length = 0

	// Set the same position twice
	game.setCellAt(1, 1, '.')
	game.setCellAt(1, 1, '.')

	// Should have been called twice with same position
	expect(receivedPositions).toEqual([
		[1, 1],
		[1, 1],
	])
})

