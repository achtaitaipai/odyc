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

export const chunkText = (text: string, chunckLength: number) => {
	const regex = new RegExp(
		`(.{1,${chunckLength}})( +\|$\\n?)\|(.{1,${chunckLength}})|(\n)`,
		'gm',
	)
	return Array.from(text.match(regex) ?? [])
}

export const isUrl = (str: string) => {
	try {
		new URL(str)
		return true
	} catch (_) {
		return false
	}
}
