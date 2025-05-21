import { drawChar } from './font'
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
const MAX_CHARS_PER_LINE = 24
const LINE_GAP = 10
const PADDING_X = 10
const PADDING_Y = 10
const CHAR_WIDTH = 8

type TextChunk = { char: string; color: number | string }[]

export class Dialog {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: () => void
	#text?: TextChunk[]
	#lines: TextChunk[] = []
	#lineCursor = 0
	#currentChunk?: TextChunk
	#requestAnimationFrameId?: number
	#lastTime = 0
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

		this.#resize()
		document.body.append(this.#canvas)
		window.addEventListener('resize', this.#resize)

		this.#boxHeight =
			MAX_LINES * CHAR_WIDTH + PADDING_Y * 2 + LINE_GAP * (MAX_LINES - 1)
		this.#boxY = this.#canvas.height - this.#boxHeight - 8
		this.#boxWidth = MAX_CHARS_PER_LINE * 8 + PADDING_X * 2
		this.#boxX = (this.#canvas.width - this.#boxWidth) * 0.5
	}

	async open(text: string) {
		this.#canvas.style.setProperty('display', 'block')
		this.#text = this.#parseText(text)
		this.#currentChunk = this.#text.shift()
		this.#requestAnimationFrameId = requestAnimationFrame(this.#update)
		this.isOpen = true
		//TODO CLEAN
		this.#lines = Array(MAX_LINES).map((_) => [])
		this.#render()

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	#parseText(text: string) {
		const colors: (string | number)[] = []
		const tokens = text.match(/{\/?\d}|./g)
		const colorsQueue: number[] = []
		if (!tokens) return []
		for (let index = 0; index < tokens.length; index++) {
			const element = tokens[index]
			if (!element) continue
			if (/{\d}/.test(element)) {
				const color = +element.charAt(1)
				colorsQueue.push(color)
				continue
			}
			if (/{\/\d}/.test(element) && +element.charAt(2) === colorsQueue.at(-1)) {
				colorsQueue.pop()
				continue
			}
			colors.push(colorsQueue.at(-1) ?? this.#contentColor)
		}
		return [...this.#textSlicer(text.replace(/{\/?\d}/g, ''))].map((slice) =>
			slice.split('').map((char) => ({
				char,
				color: colors.shift()!,
			})),
		)
	}

	next() {
		if (!this.isOpen) return
		if (this.#currentChunk?.length === 0 || this.#currentChunk === undefined) {
			this.#currentChunk = this.#text?.shift()
			if (this.#currentChunk === undefined) {
				this.#close()
				return
			}
			this.#lineCursor++
			if (this.#lineCursor >= MAX_LINES) {
				this.#lineCursor = 0
				this.#lines = this.#lines.map(() => [])
				this.#render()
			}
		}
	}

	#update = (now: number) => {
		this.#requestAnimationFrameId = requestAnimationFrame(this.#update)
		if (now - this.#lastTime < TYPING_INTERVAL_MS) return
		this.#lastTime = now
		if (this.#currentChunk?.length === 0 && this.#lineCursor < MAX_LINES - 1) {
			this.#lineCursor++
			this.#currentChunk = this.#text?.shift()
		}

		let newChar = this.#currentChunk?.shift()

		if (newChar) {
			this.#lines[this.#lineCursor]?.push(newChar)
			this.#render()
		}
	}

	#close() {
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#lineCursor = 0
		this.#resolvePromise?.()
		this.#requestAnimationFrameId &&
			cancelAnimationFrame(this.#requestAnimationFrameId)
	}

	#resize = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this.#canvas.style.setProperty('width', `${sideSize}px`)
		this.#canvas.style.setProperty('height', `${sideSize}px`)
		this.#canvas.style.setProperty('left', `${left}px`)
		this.#canvas.style.setProperty('top', `${top}px`)
	}

	#render = () => {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#getColor(this.#backgroundColor)
		this.#ctx.fillRect(this.#boxX, this.#boxY, this.#boxWidth, this.#boxHeight)
		this.#ctx.fillStyle = this.#getColor(this.#strokeColor)
		for (let x = 0; x < this.#boxWidth; x++) {
			this.#ctx.fillRect(this.#boxX + x, this.#boxY - 1, 1, 2)
			this.#ctx.fillRect(this.#boxX + x, this.#boxY + this.#boxHeight, 1, 2)
		}
		for (let y = 0; y < this.#boxHeight; y++) {
			this.#ctx.fillRect(this.#boxX - 1, this.#boxY + y, 2, 1)
			this.#ctx.fillRect(this.#boxX + this.#boxWidth, this.#boxY + y, 2, 1)
		}
		this.#ctx.fillStyle = this.#getColor(this.#contentColor)
		this.#lines.forEach((line, i) => {
			const lineX = this.#boxX + PADDING_X
			const lineY = this.#boxY + PADDING_Y + 8 * i + i * LINE_GAP
			line.forEach((c, charIndex) => {
				this.#ctx.fillStyle = this.#getColor(c.color)
				drawChar(this.#ctx, c.char, lineX + charIndex * 8, lineY)
			})
		})
	};

	*#textSlicer(text: string) {
		const words = text.split(' ')
		let lineIndex = 0
		let slice: string[] = []

		while (words.length > 0) {
			const maxSize = MAX_CHARS_PER_LINE
			while (true) {
				const chunk = words.shift()
				if (!chunk) break
				if (chunk === '|') break
				if (slice.join(' ').length + chunk.length > maxSize) {
					words.unshift(chunk)
					break
				}
				slice.push(chunk)
			}
			if (slice.join(' ').length >= MAX_CHARS_PER_LINE)
				words.unshift(slice.pop() ?? '')
			let result = slice.join(' ')
			yield result
			lineIndex = (lineIndex + 1) % MAX_LINES
			slice = []
		}
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
