import { drawChar } from './font'
import { chunkText } from './lib'
import { RendererParams } from './renderer'

export type DialogParams = {
	dialogBackground: string | number
	dialogColor: string | number
	dialogStroke: string | number
	colors: RendererParams['colors']
}

const CANVAS_SIZE = 256
const TYPING_INTERVAL_MS = 50
const MAX_LINES = 2
const MAX_CHARS_PER_LINE = 18
const LINE_GAP = 6
const PADDING_X = 20
const PADDING_Y = 10
const CHAR_WIDTH = 8
const BOX_RADIUS = 8
const BOX_OUTLINE = 2

type Line = { char: string; color: number | string }[]

export class Dialog {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: () => void

	// All remaining lines to be displayed
	#remainingLines?: Line[]
	// Queue of characters currently being typed, line by line
	#currentLineQueue?: Line

	// Lines currently visible on screen
	#displayedLines: Line[] = []
	#lineCursor = 0
	#animationId?: number
	#lastFrameTime = 0

	isOpen = false

	#configColors: RendererParams['colors']
	#backgroundColor: string | number
	#contentColor: string | number
	#strokeColor: string | number

	#boxHeight: number
	#boxWidth: number
	#boxX: number
	#boxY: number

	constructor(params: DialogParams) {
		this.#backgroundColor = params.dialogBackground
		this.#contentColor = params.dialogColor
		this.#strokeColor = params.dialogStroke
		this.#configColors = params.colors

		this.#canvas = document.createElement('canvas')
		this.#canvas.style.setProperty('position', 'absolute')
		this.#canvas.style.setProperty('box-sizing', 'border-box')
		this.#canvas.style.setProperty('display', 'none')
		this.#canvas.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvas.getContext('2d')!
		this.#canvas.width = CANVAS_SIZE
		this.#canvas.height = CANVAS_SIZE
		this.#canvas.classList.add('odyc-dialog-canvas')

		this.#resizeCanvas()
		document.body.append(this.#canvas)
		window.addEventListener('resize', this.#resizeCanvas)

		this.#boxWidth = MAX_CHARS_PER_LINE * 8 + PADDING_X * 2
		this.#boxHeight =
			MAX_LINES * CHAR_WIDTH + PADDING_Y * 2 + LINE_GAP * (MAX_LINES - 1)
		this.#boxY = this.#canvas.height - this.#boxHeight - 8
		this.#boxX = (this.#canvas.width - this.#boxWidth) * 0.5
	}

	async open(text: string) {
		this.isOpen = true
		this.#canvas.style.setProperty('display', 'block')

		this.#remainingLines = this.#parseText(text)
		this.#currentLineQueue = this.#remainingLines.shift()
		this.#displayedLines = new Array(MAX_LINES).fill(null).map((_) => [])

		this.#animationId = requestAnimationFrame(this.#update)
		this.#renderFrame()

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	next() {
		// If there are still characters left to type in the current line, do nothing
		if (this.#currentLineQueue && this.#currentLineQueue.length > 0) return

		// Load the next line from the remaining lines queue
		this.#currentLineQueue = this.#remainingLines?.shift()

		// If there are no more lines to display, close the dialog
		if (this.#currentLineQueue === undefined) {
			this.#close()
			return
		}

		// Reset to a new dialog box (clear lines and restart cursor)
		this.#lineCursor = 0
		this.#displayedLines = this.#displayedLines.map(() => [])
		this.#renderFrame()
	}

	#update = (now: number) => {
		this.#animationId = requestAnimationFrame(this.#update)
		if (now - this.#lastFrameTime < TYPING_INTERVAL_MS) return
		this.#lastFrameTime = now
		if (
			this.#currentLineQueue?.length === 0 &&
			this.#lineCursor < MAX_LINES - 1
		) {
			this.#lineCursor++
			this.#currentLineQueue = this.#remainingLines?.shift()
		}

		let newChar = this.#currentLineQueue?.shift()

		if (newChar) {
			this.#displayedLines[this.#lineCursor]?.push(newChar)
			this.#renderNewChar()
		}
	}

	#close() {
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#lineCursor = 0
		this.#resolvePromise?.()
		this.#animationId && cancelAnimationFrame(this.#animationId)
	}

	#resizeCanvas = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this.#canvas.style.setProperty('width', `${sideSize}px`)
		this.#canvas.style.setProperty('height', `${sideSize}px`)
		this.#canvas.style.setProperty('left', `${left}px`)
		this.#canvas.style.setProperty('top', `${top}px`)
	}

	#renderFrame() {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

		const step = BOX_OUTLINE
		const xEnd = this.#boxX + this.#boxWidth
		const yEnd = this.#boxY + this.#boxHeight

		for (let py = this.#boxY; py <= yEnd - step; py += step) {
			for (let px = this.#boxX; px <= xEnd - step; px += step) {
				const dx = px - this.#boxX + step / 2
				const dy = py - this.#boxY + step / 2

				const inLeft = dx < BOX_RADIUS
				const inRight = dx >= this.#boxWidth - BOX_RADIUS
				const inTop = dy < BOX_RADIUS
				const inBottom = dy >= this.#boxHeight - BOX_RADIUS

				let inOuter = true
				let inInner = false

				// coins
				if (inLeft && inTop) {
					const dist = Math.hypot(dx - BOX_RADIUS, dy - BOX_RADIUS)
					inOuter = dist <= BOX_RADIUS
					inInner = dist <= BOX_RADIUS - step
				} else if (inRight && inTop) {
					const dist = Math.hypot(
						dx - (this.#boxWidth - BOX_RADIUS),
						dy - BOX_RADIUS,
					)
					inOuter = dist <= BOX_RADIUS
					inInner = dist <= BOX_RADIUS - step
				} else if (inLeft && inBottom) {
					const dist = Math.hypot(
						dx - BOX_RADIUS,
						dy - (this.#boxHeight - BOX_RADIUS),
					)
					inOuter = dist <= BOX_RADIUS
					inInner = dist <= BOX_RADIUS - step
				} else if (inRight && inBottom) {
					const dist = Math.hypot(
						dx - (this.#boxWidth - BOX_RADIUS),
						dy - (this.#boxHeight - BOX_RADIUS),
					)
					inOuter = dist <= BOX_RADIUS
					inInner = dist <= BOX_RADIUS - step
				} else {
					const edge =
						dx < step ||
						dx >= this.#boxWidth - step ||
						dy < step ||
						dy >= this.#boxHeight - step
					inOuter = true
					inInner = !edge
				}

				if (inOuter) {
					this.#ctx.fillStyle = this.#getColor(
						inInner ? this.#backgroundColor : this.#strokeColor,
					)
					this.#ctx.fillRect(px, py, step, step)
				}
			}
		}
	}

	#renderNewChar = () => {
		const currentLine = this.#displayedLines[this.#lineCursor]
		if (!currentLine) return
		const lastChar = currentLine.at(-1)
		if (!lastChar) return
		this.#ctx.fillStyle = this.#getColor(lastChar.color)
		const posY =
			this.#boxY +
			PADDING_Y +
			8 * this.#lineCursor +
			this.#lineCursor * LINE_GAP
		const posX = (currentLine.length - 1) * CHAR_WIDTH + this.#boxX + PADDING_Y
		drawChar(this.#ctx, lastChar.char, posX, posY)
	}

	#parseText(text: string) {
		const colorCodes: (string | number)[] = []
		const activeColors: number[] = []

		const tokens = text.match(/{\/?\d}|./g)
		if (!tokens) return []

		for (const token of tokens) {
			if (!token) continue

			const openMatch = token.match(/{(\d)}/)
			const closeMatch = token.match(/{\/(\d)}/)

			if (openMatch && openMatch[1]) {
				activeColors.push(+openMatch[1])
			} else if (
				closeMatch &&
				closeMatch[1] &&
				+closeMatch[1] === activeColors.at(-1)
			) {
				activeColors.pop()
			} else {
				colorCodes.push(activeColors.at(-1) ?? this.#contentColor)
			}
		}

		// Strip color tokens from text
		const plainText = text.replace(/{\/?\d}/g, '')

		// Map colors to characters line-by-line
		return chunkText(plainText, MAX_CHARS_PER_LINE).map((line) =>
			line.split('').map((char) => ({
				char,
				color: colorCodes.shift()!,
			})),
		)
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
