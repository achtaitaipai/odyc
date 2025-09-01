import { Canvas, getCanvas } from './canvas'
import {
	PROMPT_BOX_OUTLINE,
	PROMPT_CANVAS_ID,
	PROMPT_CANVAS_SIZE,
	PROMPT_FONT_SIZE,
	PROMPT_LINE_GAP,
	PROMPT_MAX_CHARS_PER_LINE,
	PROMPT_OPTIONS_BY_LINE,
	PROMPT_PADDING_X,
	PROMPT_PADDING_Y,
} from './consts'
import { DialogParams } from './dialog'
import { Input } from './inputs'
import { resolveTick, TextFx } from './lib'
import { RendererParams } from './renderer'

export interface MenuOption {
	[label: string]: MenuOption | null | Function
}

export class Prompt {
	#canvas: Canvas
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

		this.#canvas = getCanvas({
			id: PROMPT_CANVAS_ID,
			zIndex: 10,
			root: params.root,
		})
		this.#canvas.setSize(PROMPT_CANVAS_SIZE, PROMPT_CANVAS_SIZE)
		this.#canvas.hide()
		this.#ctx = this.#canvas.get2dCtx()
	}

	get #rect() {
		const width = PROMPT_MAX_CHARS_PER_LINE * 8 + PROMPT_PADDING_X * 2
		const left = (PROMPT_CANVAS_SIZE - width) * 0.5
		const top = Math.floor(PROMPT_CANVAS_SIZE / 15)
		const max_lines = Math.max(
			Math.ceil(this.#options.length / PROMPT_OPTIONS_BY_LINE),
			2,
		)
		const height =
			max_lines * PROMPT_FONT_SIZE +
			PROMPT_PADDING_Y * 2 +
			PROMPT_LINE_GAP * (max_lines - 1)
		return {
			left,
			top,
			width,
			height,
		}
	}

	async openMenu(options: MenuOption): Promise<void> {
		const labels = Object.keys(options)
		const choice = labels[await this.open(...labels)]
		if (!choice || !(choice in options)) return

		const result = options[choice]
		if (!result) return

		if (typeof result === 'function') return result()
		return await this.openMenu(result)
	}

	async open(...options: string[]) {
		if (!options.length) return -1
		this.#index = 0
		this.isOpen = true
		this.#canvas.show()
		this.#options = options

		this.#render()
		resolveTick()

		return new Promise<number>((res) => {
			this.#resolvePromise = (index: number) => res(index)
		})
	}

	input(input: Input) {
		const height = Math.ceil(this.#options.length / PROMPT_OPTIONS_BY_LINE)
		let y = Math.floor(this.#index / PROMPT_OPTIONS_BY_LINE)
		let x = this.#index - y * PROMPT_OPTIONS_BY_LINE
		switch (input) {
			case 'LEFT':
				x = Math.max(0, x - 1)
				break
			case 'UP':
				y = Math.max(0, y - 1)
				break
			case 'RIGHT':
				x = Math.min(x + 1, PROMPT_OPTIONS_BY_LINE - 1)
				break
			case 'DOWN':
				y = Math.min(y + 1, height - 1)
				break
			case 'ACTION':
				this.close()
				return
		}
		this.#index = Math.min(
			y * PROMPT_OPTIONS_BY_LINE + x,
			this.#options.length - 1,
		)
		this.#render()
	}

	close() {
		this.isOpen = false
		this.#canvas.hide()
		this.#resolvePromise?.(this.#index)
		resolveTick()
	}

	#render() {
		this.#drawBox()
		const { left, top, width } = this.#rect
		this.#ctx.fillStyle = this.#contentColor
		const maxCharsByWord = Math.ceil(
			PROMPT_MAX_CHARS_PER_LINE / PROMPT_OPTIONS_BY_LINE -
				PROMPT_OPTIONS_BY_LINE,
		)
		for (let index = 0; index < this.#options.length; index++) {
			const text = this.#options[index]?.slice(0, maxCharsByWord)
			if (!text) continue
			const line = Math.floor(index / PROMPT_OPTIONS_BY_LINE)
			const column = index - line * PROMPT_OPTIONS_BY_LINE
			const x =
				left +
				PROMPT_PADDING_X +
				(column * (width - PROMPT_PADDING_X * 2)) / PROMPT_OPTIONS_BY_LINE +
				(column + 1) * PROMPT_FONT_SIZE
			const y = top + PROMPT_PADDING_Y + 8 * line + line * PROMPT_LINE_GAP
			TextFx.text(this.#ctx, text, x, y)
		}
		this.#drawCursor()
	}

	#drawCursor() {
		const line = Math.floor(this.#index / PROMPT_OPTIONS_BY_LINE)
		const column = this.#index - line * PROMPT_OPTIONS_BY_LINE
		const { left, top, width } = this.#rect
		const x =
			left +
			PROMPT_PADDING_X +
			(column * (width - PROMPT_PADDING_X * 2)) / PROMPT_OPTIONS_BY_LINE +
			column * PROMPT_FONT_SIZE
		const y = top + PROMPT_PADDING_Y + 8 * line + line * PROMPT_LINE_GAP
		for (let px = 0; px < PROMPT_FONT_SIZE / 2; px++) {
			this.#ctx.fillRect(x + px, y + px, 1, 8 - 2 * px)
		}
	}

	#drawBox() {
		this.#ctx.clearRect(0, 0, PROMPT_CANVAS_SIZE, PROMPT_CANVAS_SIZE)
		this.#ctx.fillStyle = this.#borderColor
		const { left, top, height, width } = this.#rect
		this.#ctx.fillRect(
			left - PROMPT_BOX_OUTLINE,
			top - PROMPT_BOX_OUTLINE,
			width + PROMPT_BOX_OUTLINE * 2,
			height + PROMPT_BOX_OUTLINE * 2,
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
