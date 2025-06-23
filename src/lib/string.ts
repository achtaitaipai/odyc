import { COLORS_CHARSET } from '../consts.js'
import { Position } from '../types.js'

export const createGridFromString = (template: string) => {
	return template
		.trim() //removes whitespace from both ends
		.replace(/[ \t]/gm, '') //removes tabs and whitespaces
		.split(/\n+/gm) //split by lines and ignore multiple return
}

export const getGridSize = (grid: string[]): Position => {
	const height = grid.length
	const width = Math.max(...grid.map((row) => row.length))
	return [width, height]
}

export const chunkText = (
	text: string,
	maxLength: number,
	separator = '\n',
) => {
	const slices = text.split(separator)
	const chunks: string[] = []
	let current: string[] = []
	slices.forEach((slice) => {
		slice.split(' ').forEach((word) => {
			const withWord = [...current, word].join(' ')
			if (withWord.length >= maxLength) {
				if (current.length > 0) {
					chunks.push(current.join(' ') + ' ')
					current = [word]
				} else {
					chunks.push(word.slice(0, maxLength))
					current = [word.slice(maxLength)]
				}
			} else {
				current.push(word)
			}
		})
		chunks.push(current.join(' ') + ' ')
		current = []
	})
	return chunks
}

export const isUrl = (str: string) => {
	try {
		new URL(str)
		return true
	} catch (_) {
		return false
	}
}

export const resolveColor = (
	text: string | number,
	palette: string[],
) => {
	text = `${text}`
	if (text.length > 1) return text
	const charIndex = COLORS_CHARSET.findIndex((ch) => ch === text)
	if (charIndex === -1 || charIndex >= palette.length) return 'transparent'
	const color = palette[charIndex]
	return color ?? 'transparent'
}
