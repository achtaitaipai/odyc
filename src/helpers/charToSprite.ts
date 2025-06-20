import { characters, FONT_SIZE } from '../lib'

export function charToSprite(char: string, color?: string) {
	const charCode = char.charCodeAt(0)
	const charSet = characters.find(
		(el) => charCode >= el.start && charCode < el.start + el.characters.length,
	)
	if (!charSet) return ''
	const charTemplate = charSet.characters[charCode - charSet.start]
	if (!charTemplate) return ''
	let sprite = ''
	for (let cy = 0; cy < FONT_SIZE; cy++) {
		const row = charTemplate[cy]
		if (row === undefined) continue
		for (let cx = 0; cx < FONT_SIZE; cx++) {
			if (row & (1 << cx)) {
				sprite += color
			} else sprite += '.'
		}
		sprite += '\n'
	}
	return sprite
}
