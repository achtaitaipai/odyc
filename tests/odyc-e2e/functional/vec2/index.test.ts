import { describe, it, expect } from 'vitest'
import { vec2 } from 'odyc'

describe('Vec2 class and vec2 helper', () => {
	describe('construction and properties', () => {
		it('should create a vector with correct x, y values', () => {
			const v1 = vec2([3, 4])
			expect(v1.x).toBe(3)
			expect(v1.y).toBe(4)
			const v2 = vec2(3, 4)
			expect(v2.x).toBe(3)
			expect(v2.y).toBe(4)
		})

		it('should return correct value array', () => {
			const v = vec2([3, 4])
			expect(v.value).toEqual([3, 4])
		})

		it('should calculate correct length', () => {
			const v1 = vec2([3, 4])
			const v2 = vec2([0, 0])
			const v3 = vec2([1, 0])

			expect(v1.length).toBe(5)
			expect(v2.length).toBe(0)
			expect(v3.length).toBe(1)
		})

		it('should handle negative coordinates', () => {
			const v = vec2([-3, -4])
			expect(v.x).toBe(-3)
			expect(v.y).toBe(-4)
			expect(v.length).toBe(5)
		})
	})

	describe('add', () => {
		it('should add two vectors (Vec2 input)', () => {
			const v1 = vec2([3, 4])
			const v2 = vec2([1, 2])
			const result = v1.add(v2)

			expect(result.value).toEqual([4, 6])
		})

		it('should add vector and array', () => {
			const v1 = vec2([3, 4])
			const result = v1.add([1, 2])

			expect(result.value).toEqual([4, 6])
		})

		it('should not mutate original vector', () => {
			const v1 = vec2([3, 4])
			const v2 = vec2([1, 2])
			v1.add(v2)

			expect(v1.value).toEqual([3, 4])
		})
	})

	describe('sub', () => {
		it('should subtract two vectors (Vec2 input)', () => {
			const v1 = vec2([3, 4])
			const v2 = vec2([1, 2])
			const result = v1.sub(v2)

			expect(result.value).toEqual([2, 2])
		})

		it('should subtract array from vector', () => {
			const v1 = vec2([3, 4])
			const result = v1.sub([1, 2])

			expect(result.value).toEqual([2, 2])
		})
	})

	describe('multiply', () => {
		it('should multiply by scalar', () => {
			const v = vec2([3, 4])
			const result = v.multiply(2)

			expect(result.value).toEqual([6, 8])
		})

		it('should handle zero multiplication', () => {
			const v = vec2([3, 4])
			const result = v.multiply(0)

			expect(result.value).toEqual([0, 0])
		})
	})

	describe('divide', () => {
		it('should divide by scalar', () => {
			const v = vec2([6, 8])
			const result = v.divide(2)

			expect(result.value).toEqual([3, 4])
		})

		it('should handle fractional results', () => {
			const v = vec2([3, 4])
			const result = v.divide(2)

			expect(result.value).toEqual([1.5, 2])
		})
	})

	describe('distance', () => {
		it('should calculate distance between two vectors', () => {
			const v1 = vec2([0, 0])
			const v2 = vec2([3, 4])
			const distance = v1.distance(v2)

			expect(distance).toBe(5)
		})

		it('should calculate distance with array input', () => {
			const v = vec2([0, 0])
			const distance = v.distance([3, 4])

			expect(distance).toBe(5)
		})

		it('should return 0 for same point', () => {
			const v = vec2([3, 4])
			const distance = v.distance([3, 4])

			expect(distance).toBe(0)
		})

		it('should be symmetric', () => {
			const v1 = vec2([1, 2])
			const v2 = vec2([4, 6])

			expect(v1.distance(v2)).toBe(v2.distance(v1))
		})
	})

	describe('manhattanDistance', () => {
		it('should calculate Manhattan distance between two vectors', () => {
			const v1 = vec2([0, 0])
			const v2 = vec2([3, 4])
			const distance = v1.manhattanDistance(v2)

			expect(distance).toBe(7) // |3-0| + |4-0| = 3 + 4 = 7
		})

		it('should calculate Manhattan distance with array input', () => {
			const v = vec2([0, 0])
			const distance = v.manhattanDistance([3, 4])

			expect(distance).toBe(7)
		})

		it('should return 0 for same point', () => {
			const v = vec2([3, 4])
			const distance = v.manhattanDistance([3, 4])

			expect(distance).toBe(0)
		})

		it('should be symmetric', () => {
			const v1 = vec2([1, 2])
			const v2 = vec2([4, 6])

			expect(v1.manhattanDistance(v2)).toBe(v2.manhattanDistance(v1))
		})

		it('should handle negative coordinates', () => {
			const v1 = vec2([-2, -3])
			const v2 = vec2([1, 2])
			const distance = v1.manhattanDistance(v2)

			expect(distance).toBe(8) // |1-(-2)| + |2-(-3)| = 3 + 5 = 8
		})

		it('should handle mixed positive/negative coordinates', () => {
			const v1 = vec2([-1, 3])
			const v2 = vec2([2, -1])
			const distance = v1.manhattanDistance(v2)

			expect(distance).toBe(7) // |2-(-1)| + |-1-3| = 3 + 4 = 7
		})

		it('should differ from Euclidean distance', () => {
			const v1 = vec2([0, 0])
			const v2 = vec2([3, 4])

			const manhattanDist = v1.manhattanDistance(v2) // 7
			const euclideanDist = v1.distance(v2) // 5

			expect(manhattanDist).toBe(7)
			expect(euclideanDist).toBe(5)
			expect(manhattanDist).toBeGreaterThan(euclideanDist)
		})

		it('should equal Euclidean distance for axis-aligned movement', () => {
			// When moving only horizontally or vertically, Manhattan = Euclidean
			const v1 = vec2([0, 0])
			const v2 = vec2([5, 0]) // Only horizontal movement
			const v3 = vec2([0, 3]) // Only vertical movement

			expect(v1.manhattanDistance(v2)).toBe(v1.distance(v2))
			expect(v1.manhattanDistance(v3)).toBe(v1.distance(v3))
		})

		it('should work with floating point coordinates', () => {
			const v1 = vec2([0.5, 1.5])
			const v2 = vec2([2.5, 3.5])
			const distance = v1.manhattanDistance(v2)

			expect(distance).toBe(4) // |2.5-0.5| + |3.5-1.5| = 2 + 2 = 4
		})
	})

	describe('direction', () => {
		it('should return direction for positive values', () => {
			const v = vec2([5, 3])
			const dir = v.direction

			expect(dir.value).toEqual([1, 1])
		})

		it('should return direction for negative values', () => {
			const v = vec2([-5, -3])
			const dir = v.direction

			expect(dir.value).toEqual([-1, -1])
		})

		it('should return direction for mixed values', () => {
			const v = vec2([5, -3])
			const dir = v.direction

			expect(dir.value).toEqual([1, -1])
		})

		it('should handle zero values', () => {
			const v1 = vec2([0, 5])
			const v2 = vec2([3, 0])
			const v3 = vec2([0, 0])

			expect(v1.direction.value).toEqual([0, 1])
			expect(v2.direction.value).toEqual([1, 0])
			expect(v3.direction.value).toEqual([0, 0])
		})

		it('should handle decimal values correctly', () => {
			const v = vec2([0.1, -0.5])
			const dir = v.direction

			expect(dir.value).toEqual([1, -1])
		})

		it('should work with very small non-zero values', () => {
			const v = vec2([0.0001, -0.0001])
			const dir = v.direction

			expect(dir.value).toEqual([1, -1])
		})
	})

	describe('isEquals', () => {
		it('should compare two vec2', () => {
			expect(vec2([5, 3]).equals([3, 4])).toBe(false)
			expect(vec2([3, 3]).equals([3, 3])).toBe(true)
		})
	})
})
