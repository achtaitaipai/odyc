import { DialogParams } from './dialog'
import { Input } from './inputs'
import { TextFx } from './lib'
import { modulo } from './lib/math'
import { RendererParams } from './renderer'

const CANVAS_SIZE = 384
const OPTIONS_BY_LINE = 2
const MAX_CHARS_PER_LINE = 28
const LINE_GAP = 10
const PADDING_X = 8
const PADDING_Y = 12
const FONT_SIZE = 8
const BOX_OUTLINE = 2

export class Prompt {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: (index: number) => void

	isOpen = false
	#options: string[] = []
	#index = 0

	#configColors: RendererParams['colors']
	#backgroundColor: string
	#contentColor: string
	#borderColor: string

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
		this.#canvas.classList.add('odyc-prompt-canvas')

		this.#resizeCanvas()
		document.body.append(this.#canvas)
		window.addEventListener('resize', this.#resizeCanvas)
	}

	get #rect() {
		const width = MAX_CHARS_PER_LINE * 8 + PADDING_X * 2
		const left = (this.#canvas.width - width) * 0.5
		const top = Math.floor(CANVAS_SIZE / 15)
		const max_lines = Math.max(
			Math.ceil(this.#options.length / OPTIONS_BY_LINE),
			2,
		)
		const height =
			max_lines * FONT_SIZE + PADDING_Y * 2 + LINE_GAP * (max_lines - 1)
		return {
			left,
			top,
			width,
			height,
		}
	}

	async open(...options: string[]) {
		if (!options.length) return -1
		this.isOpen = true
		this.#canvas.style.setProperty('display', 'block')
		this.#options = options

		this.#render()

		return new Promise<number>((res) => {
			this.#resolvePromise = (index: number) => res(index)
		})
	}

	input(input: Input) {
		const height = Math.ceil(this.#options.length / OPTIONS_BY_LINE)
		let y = Math.floor(this.#index / OPTIONS_BY_LINE)
		let x = this.#index - y * OPTIONS_BY_LINE
		switch (input) {
			case 'LEFT':
				x = modulo(x - 1, OPTIONS_BY_LINE)
				break
			case 'UP':
				y = modulo(y - 1, height)
				break
			case 'RIGHT':
				x = modulo(x + 1, OPTIONS_BY_LINE)
				break
			case 'DOWN':
				y = modulo(y + 1, height)
				break
			case 'ACTION':
				this.#close()
				return
		}
		this.#index = Math.min(y * OPTIONS_BY_LINE + x, this.#options.length - 1)
		this.#render()
	}

	#close() {
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#resolvePromise?.(this.#index)
	}

	#render() {
		this.#drawBox()
		const { left, top, width } = this.#rect
		this.#ctx.fillStyle = this.#contentColor
		const maxCharsByWord = Math.ceil(
			MAX_CHARS_PER_LINE / OPTIONS_BY_LINE - OPTIONS_BY_LINE,
		)
		for (let index = 0; index < this.#options.length; index++) {
			const text = this.#options[index]?.slice(0, maxCharsByWord)
			if (!text) continue
			const line = Math.floor(index / OPTIONS_BY_LINE)
			const column = index - line * OPTIONS_BY_LINE
			const x =
				left +
				PADDING_X +
				(column * (width - PADDING_X * 2)) / OPTIONS_BY_LINE +
				(column + 1) * FONT_SIZE
			const y = top + PADDING_Y + 8 * line + line * LINE_GAP
			TextFx.text(this.#ctx, text, x, y)
		}
		this.#drawCursor()
	}

	#drawCursor() {
		const line = Math.floor(this.#index / OPTIONS_BY_LINE)
		const column = this.#index - line * OPTIONS_BY_LINE
		const { left, top, width } = this.#rect
		const x =
			left +
			PADDING_X +
			(column * (width - PADDING_X * 2)) / OPTIONS_BY_LINE +
			column * FONT_SIZE
		const y = top + PADDING_Y + 8 * line + line * LINE_GAP
		for (let px = 0; px < FONT_SIZE / 2; px++) {
			this.#ctx.fillRect(x + px, y + px, 1, 8 - 2 * px)
		}
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
		const { left, top, height, width } = this.#rect
		this.#ctx.fillRect(
			left - BOX_OUTLINE,
			top - BOX_OUTLINE,
			width + BOX_OUTLINE * 2,
			height + BOX_OUTLINE * 2,
		)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(left, top, width, height)
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initPrompt = (params: DialogParams) => new Prompt(params)
