import { COLORS_CHARSET } from '../consts'
import { createGridFromString, getGridSize } from '../lib'

export function mergeSprites(
	...sprites: (string | false | null | undefined)[]
) {
	const validSprites = sprites.filter((el) => typeof el === 'string')
	if (validSprites.length === 0) return ''
	const grids = validSprites.map(createGridFromString)
	const dimensions = grids.map(getGridSize)
	const width = Math.max(...dimensions.map((el) => el[0]))
	const height = Math.max(...dimensions.map((el) => el[1]))
	const newGrid = [...Array(height)].map(() => [...Array(width)].map(() => '.'))
	for (const sprite of grids) {
		for (let y = 0; y < height; y++) {
			const row = sprite[y]
			if (!row) continue
			for (let x = 0; x < width; x++) {
				const char = row[x]
				if (!char || !COLORS_CHARSET.includes(char)) continue
				newGrid[y]![x] = char
			}
		}
	}
	return newGrid.map((row) => row.join('')).join('\n')
}
