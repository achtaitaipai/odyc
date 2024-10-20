import { characters } from './characters'

const FONTHEIGHT = 8
const FONTWIDTH = 8

export const drawText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
) => {
	for (let charIndex = 0; charIndex < text.length; charIndex++) {
		const char = text[charIndex]
		if (char === undefined) continue
		drawChar(ctx, char, x + charIndex * FONTWIDTH, y)
	}
}

const drawChar = (
	ctx: CanvasRenderingContext2D,
	char: string,
	x: number,
	y: number,
) => {
	const charCode = char.charCodeAt(0)
	const charTemplate = getCharTemplate(charCode)
	if (!charTemplate) return
	for (let cy = 0; cy < FONTHEIGHT; cy++) {
		const row = charTemplate[cy]
		if (row === undefined) continue
		for (let cx = 0; cx < FONTWIDTH; cx++) {
			if (row & (1 << cx)) {
				ctx.fillRect(x + cx, y + cy, 1, 1)
			}
		}
	}
}

const getCharTemplate = (code: number) => {
	const charSet = characters.find(
		(el) => code >= el.start && code < el.start + el.characters.length,
	)
	if (!charSet) return null
	return charSet.characters[code - charSet.start]
}
