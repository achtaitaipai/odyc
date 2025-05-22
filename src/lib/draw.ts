import { characters } from '../font'
const FONT_HEIGHT = 8
const FONT_WIDTH = 8

export function drawRect(
	ctx: CanvasRenderingContext2D,
	pX: number,
	pY: number,
	width: number,
	height: number,
	radius = 0,
) {
	if (radius === 0) {
		ctx.fillRect(pX, pY, width, height)
	}
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (x < radius && y < radius) {
				const distance = Math.hypot(y - radius, x - radius)
				if (distance > radius) continue
			} else if (x > width - radius && y < radius) {
				const distance = Math.hypot(y - radius, x - (width - radius))
				if (distance > radius) continue
			} else if (x < radius && y > height - radius) {
				const distance = Math.hypot(y - (height - radius), x - radius)
				if (distance > radius) continue
			} else if (x > width - radius && y > height - radius) {
				const distance = Math.hypot(y - (height - radius), x - (width - radius))
				if (distance > radius) continue
			}

			ctx.fillRect(x + pX, y + pY, 1, 1)
		}
	}
}

export function drawText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
) {
	for (let charIndex = 0; charIndex < text.length; charIndex++) {
		const char = text[charIndex]
		if (char === undefined) continue
		drawChar(ctx, char, x + charIndex * FONT_WIDTH, y)
	}
}

export function drawChar(
	ctx: CanvasRenderingContext2D,
	char: string,
	x: number,
	y: number,
) {
	const charCode = char.charCodeAt(0)
	const charTemplate = getCharTemplate(charCode)
	if (!charTemplate) return
	for (let cy = 0; cy < FONT_HEIGHT; cy++) {
		const row = charTemplate[cy]
		if (row === undefined) continue
		for (let cx = 0; cx < FONT_WIDTH; cx++) {
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
