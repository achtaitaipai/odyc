import { chunkText, drawChar, drawRect } from './lib'
import { RendererParams } from './renderer'

export type DialogParams = {
	dialogBackground: string | number
	dialogColor: string | number
	dialogBorder: string | number
	colors: RendererParams['colors']
}

const CANVAS_SIZE = 384
const TYPING_INTERVAL_MS = 40
const ANIMATION_INTERVAL_MS = 0
const MAX_LINES = 2
const MAX_CHARS_PER_LINE = 28
const LINE_GAP = 10
const PADDING_X = 10
const PADDING_Y = 12
const CHAR_WIDTH = 8
const BOX_RADIUS = 8
const BOX_OUTLINE = 2

type Char = { char: string; color: number | string; effect?: string }

export class Dialog {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: () => void

	// All remaining lines to be displayed
	#remainingLines?: Char[][]
	// Queue of characters currently being typed, line by line
	#currentLineQueue?: Char[]

	// Lines currently visible on screen
	#displayedLines: Char[][] = []
	#lineCursor = 0
	#animationId?: number
	#lastCharTime = 0
	#lastFrameTime = 0

	isOpen = false

	#configColors: RendererParams['colors']
	#backgroundColor: string
	#contentColor: string
	#borderColor: string

	#boxHeight: number
	#boxWidth: number
	#boxX: number
	#boxY: number

	constructor(params: DialogParams) {
		this.#configColors = params.colors
		this.#backgroundColor = this.#getColor(params.dialogBackground)
		this.#contentColor = this.#getColor(params.dialogColor)
		this.#borderColor = this.#getColor(params.dialogBorder)

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
		this.#boxX = (this.#canvas.width - this.#boxWidth) * 0.5
		this.#boxY =
			this.#canvas.height - this.#boxHeight - Math.floor(CANVAS_SIZE / 15)
	}

	async open(text: string) {
		this.isOpen = true
		this.#canvas.style.setProperty('display', 'block')

		this.#remainingLines = this.#parseText(text)
		this.#currentLineQueue = this.#remainingLines.shift()
		this.#displayedLines = new Array(MAX_LINES).fill(null).map((_) => [])

		this.#animationId = requestAnimationFrame(this.#update)

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
	}

	#update = (now: number) => {
		this.#animationId = requestAnimationFrame(this.#update)
		if (now - this.#lastCharTime < ANIMATION_INTERVAL_MS) return
		this.#lastFrameTime = now
		if (now - this.#lastCharTime > TYPING_INTERVAL_MS) {
			this.#lastCharTime = now
			if (
				this.#currentLineQueue?.length === 0 &&
				this.#lineCursor < MAX_LINES - 1
			) {
				this.#lineCursor++
				this.#currentLineQueue = this.#remainingLines?.shift()
			}

			let newChar = this.#currentLineQueue?.shift()

			if (newChar) this.#displayedLines[this.#lineCursor]?.push(newChar)
		}
		this.#render(now)
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

	#drawBox() {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#borderColor
		drawRect(
			this.#ctx,
			this.#boxX - BOX_OUTLINE,
			this.#boxY - BOX_OUTLINE,
			this.#boxWidth + BOX_OUTLINE * 2,
			this.#boxHeight + BOX_OUTLINE * 2,
			BOX_RADIUS,
		)
		this.#ctx.fillStyle = this.#backgroundColor
		drawRect(
			this.#ctx,
			this.#boxX,
			this.#boxY,
			this.#boxWidth,
			this.#boxHeight,
			BOX_RADIUS,
		)
	}

	#render = (now: number) => {
		this.#drawBox()
		for (let y = 0; y < this.#displayedLines.length; y++) {
			const line = this.#displayedLines[y]
			if (!line) continue
			for (let x = 0; x < line.length; x++) {
				const char = line[x]
				if (!char) continue
				this.#drawChar(now, x, y, char)
			}
		}
	}

	#drawChar(now: number, x: number, y: number, char: Char) {
		let posY = this.#boxY + PADDING_Y + 8 * y + y * LINE_GAP
		let posX = x * CHAR_WIDTH + this.#boxX + PADDING_X
		switch (char.effect) {
			case 'wvy':
				posY += Math.floor(Math.sin(now * 0.01 + x) * 3)
				break
			case 'wvx':
				posX += Math.floor(Math.sin(now * 0.01 + x) * 2)
				break
			case 'shk':
				posX += Math.floor((Math.random() - 0.5) * 2)
				posY += Math.floor((Math.random() - 0.5) * 2)
				break
			case 'shkx':
				posX += Math.floor((Math.random() - 0.5) * 2)
				break
			case 'shky':
				posY += Math.floor((Math.random() - 0.5) * 2)
				break
		}
		this.#ctx.fillStyle = this.#getColor(char.color)
		drawChar(this.#ctx, char.char, posX, posY)
	}

	#parseText(text: string) {
		const colorByChar: (string | number)[] = []
		const colorsQueue: number[] = []

		const effectByChar: (string | undefined)[] = []
		const effectsQueue: string[] = []

		const tokens = text.match(/{\/?[a-z0-9]+}|./g)
		if (!tokens) return []

		for (let index = 0; index < tokens.length; index++) {
			const token = tokens[index]

			if (!token) continue
			const isChar = token.length === 1

			if (isChar) {
				colorByChar.push(colorsQueue.at(-1) ?? this.#contentColor)
				effectByChar.push(effectsQueue.at(-1))
				continue
			}
			const isClosing = token.startsWith('{/')
			const content = token.slice(isClosing ? 2 : 1, -1)
			const isColorToken = /\d/.test(content)

			if (isColorToken) {
				if (isClosing) {
					if (colorsQueue.at(-1) === +content) colorsQueue.pop()
					continue
				} else {
					colorsQueue.push(+content)
					continue
				}
			}

			if (isClosing) {
				if (effectsQueue.at(-1) === content) effectsQueue.pop()
				continue
			} else {
				effectsQueue.push(content)
				continue
			}
		}

		// Strip tokens from text
		const plainText = text.replace(/{\/?[a-z0-9]+}/g, '')

		// Map colors to characters line-by-line
		return chunkText(plainText, MAX_CHARS_PER_LINE, '|').map((line) =>
			line.split('').map((char) => ({
				char,
				color: colorByChar.shift()!,
				effect: effectByChar.shift()!,
			})),
		)
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
