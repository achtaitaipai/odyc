import { Canvas, getCanvas } from './canvas'
import {
	DIALOG_BOX_OUTLINE,
	DIALOG_CANVAS_ID,
	DIALOG_CANVAS_SIZE,
	DIALOG_FONT_SIZE,
	DIALOG_LINE_GAP,
	DIALOG_MAX_CHARS_PER_LINE,
	DIALOG_MAX_LINES,
	DIALOG_PADDING_X,
	DIALOG_PADDING_Y,
	DIALOG_SPEED,
	TEXT_ANIMATION_INTERVAL_MS,
} from './consts'
import { Char, getColorFrompalette, TextFx } from './lib'
import { RendererParams } from './renderer'

/**
 * Dialog configuration parameters
 */
export type DialogParams = {
	/** Background color for dialog box (color index or CSS color) */
	dialogBackground: string | number
	/** Text color for dialog content (color index or CSS color) */
	dialogColor: string | number
	/** Border color for dialog box outline (color index or CSS color) */
	dialogBorder: string | number
	/** Text animation speed in milliseconds between character reveals */
	dialogSpeed: keyof typeof DIALOG_SPEED
	colors: RendererParams['colors']
}

export class Dialog {
	#canvas: Canvas
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
	#lastAnimationTime = 0

	#textFx: TextFx

	isOpen = false

	#backgroundColor: string
	#contentColor: string
	#borderColor: string

	#charactersIntervalMs: number

	#boxHeight: number
	#boxWidth: number
	#boxX: number
	#boxY: number

	constructor(params: DialogParams) {
		this.#backgroundColor = getColorFrompalette(
			params.dialogBackground,
			params.colors,
		)
		this.#contentColor = getColorFrompalette(params.dialogColor, params.colors)
		this.#borderColor = getColorFrompalette(params.dialogBorder, params.colors)
		this.#charactersIntervalMs = DIALOG_SPEED[params.dialogSpeed]

		this.#canvas = getCanvas({ id: DIALOG_CANVAS_ID, zIndex: 10 })
		this.#canvas.setSize(DIALOG_CANVAS_SIZE, DIALOG_CANVAS_SIZE)
		this.#canvas.hide()
		this.#ctx = this.#canvas.get2dCtx()

		this.#boxWidth = DIALOG_MAX_CHARS_PER_LINE * 8 + DIALOG_PADDING_X * 2
		this.#boxHeight =
			DIALOG_MAX_LINES * DIALOG_FONT_SIZE +
			DIALOG_PADDING_Y * 2 +
			DIALOG_LINE_GAP * (DIALOG_MAX_LINES - 1)
		this.#boxX = (DIALOG_CANVAS_SIZE - this.#boxWidth) * 0.5
		this.#boxY =
			DIALOG_CANVAS_SIZE - this.#boxHeight - Math.floor(DIALOG_CANVAS_SIZE / 15)

		this.#textFx = new TextFx('|', this.#contentColor, params.colors)
	}

	async open(text: string) {
		if (text.length <= 0) return
		this.isOpen = true
		this.#canvas.show()

		this.#remainingLines = this.#textFx.parseText(
			text,
			DIALOG_MAX_CHARS_PER_LINE,
		)
		this.#currentLineQueue = this.#remainingLines.shift()
		this.#displayedLines = new Array(DIALOG_MAX_LINES).fill(null).map((_) => [])

		this.#animationId = requestAnimationFrame(this.#update)

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	next() {
		// If there are still characters left to type in the current line, do nothing
		if (
			(this.#currentLineQueue && this.#currentLineQueue.length > 0) ||
			this.#lineCursor < DIALOG_MAX_LINES - 1
		)
			return

		// Load the next line from the remaining lines queue
		this.#currentLineQueue = this.#remainingLines?.shift()

		// Reset to a new dialog box (clear lines and restart cursor)
		this.#lineCursor = 0
		this.#displayedLines = this.#displayedLines.map(() => [])

		// If there are no more lines to display, close the dialog
		if (this.#currentLineQueue === undefined) {
			this.close()
		}
	}

	#update = (time: number) => {
		this.#animationId = requestAnimationFrame(this.#update)

		if (time - this.#lastAnimationTime < TEXT_ANIMATION_INTERVAL_MS) return
		this.#lastAnimationTime = time

		if (time - this.#lastCharTime >= this.#charactersIntervalMs) {
			this.#lastCharTime = time
			if (
				this.#currentLineQueue?.length === 0 &&
				this.#lineCursor < DIALOG_MAX_LINES - 1
			) {
				this.#lineCursor++
				this.#currentLineQueue = this.#remainingLines?.shift()
			}

			let newChar = this.#currentLineQueue?.shift()

			if (newChar) this.#displayedLines[this.#lineCursor]?.push(newChar)
		}
		this.#render(time)
	}

	close() {
		this.isOpen = false
		this.#canvas.hide()
		this.#lineCursor = 0
		this.#resolvePromise?.()
		this.#animationId && cancelAnimationFrame(this.#animationId)
	}

	#render = (time: number) => {
		this.#drawBox()
		const posX = this.#boxX + DIALOG_PADDING_X
		for (let y = 0; y < this.#displayedLines.length; y++) {
			const line = this.#displayedLines[y]
			if (!line) continue
			const posY = this.#boxY + DIALOG_PADDING_Y + 8 * y + y * DIALOG_LINE_GAP
			this.#textFx.draw(this.#ctx, line, posX, posY, time)
		}
	}

	#drawBox() {
		this.#ctx.clearRect(0, 0, DIALOG_CANVAS_SIZE, DIALOG_CANVAS_SIZE)
		this.#ctx.fillStyle = this.#borderColor
		this.#ctx.fillRect(
			this.#boxX - DIALOG_BOX_OUTLINE,
			this.#boxY - DIALOG_BOX_OUTLINE,
			this.#boxWidth + DIALOG_BOX_OUTLINE * 2,
			this.#boxHeight + DIALOG_BOX_OUTLINE * 2,
		)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(this.#boxX, this.#boxY, this.#boxWidth, this.#boxHeight)
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
