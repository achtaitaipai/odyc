import { Position } from '../types.js'

type Vector = Position

export const addVectors = (...vectors: Vector[]): Vector =>
	vectors.reduce<Vector>(
		(acc, current) => [acc[0] + current[0], acc[1] + current[1]],
		[0, 0],
	)

export const compareVectors = (...vectors: Vector[]): boolean =>
	!vectors.some((current, i) => {
		const previous = vectors[i - 1]
		if (!previous) return false
		return previous[0] !== current[0] || previous[1] !== current[1]
	})
