import { Canvas, getCanvas } from './canvas'
import { Char, getColorFrompalette, TextFx } from './lib'
import { RendererParams } from './renderer'

export type DialogParams = {
	dialogBackground: string | number
	dialogColor: string | number
	dialogBorder: string | number
	dialogInternvalMs?: number
	colors: RendererParams['colors']
}

const DIALOG_CANVAS_ID = 'odyc-dialog-canvas'

const CANVAS_SIZE = 384
const ANIMATION_INTERVAL_MS = 30
const MAX_LINES = 2
const MAX_CHARS_PER_LINE = 28
const LINE_GAP = 10
const PADDING_X = 8
const PADDING_Y = 12
const FONT_SIZE = 8
const BOX_OUTLINE = 2

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
	#lastFrameTime = 0

	#textFx: TextFx

	isOpen = false

	#backgroundColor: string
	#contentColor: string
	#borderColor: string

	#animationIntervalMs?: number

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
		this.#animationIntervalMs = params.dialogInternvalMs

		this.#canvas = getCanvas({ id: DIALOG_CANVAS_ID, zIndex: 10 })
		this.#canvas.setSize(CANVAS_SIZE, CANVAS_SIZE)
		this.#canvas.hide()
		this.#ctx = this.#canvas.get2dCtx()

		this.#boxWidth = MAX_CHARS_PER_LINE * 8 + PADDING_X * 2
		this.#boxHeight =
			MAX_LINES * FONT_SIZE + PADDING_Y * 2 + LINE_GAP * (MAX_LINES - 1)
		this.#boxX = (CANVAS_SIZE - this.#boxWidth) * 0.5
		this.#boxY = CANVAS_SIZE - this.#boxHeight - Math.floor(CANVAS_SIZE / 15)

		this.#textFx = new TextFx('|', this.#contentColor, params.colors)
	}

	async open(text: string) {
		if (text.length <= 0) return
		this.isOpen = true
		this.#canvas.show()

		this.#remainingLines = this.#textFx.parseText(text, MAX_CHARS_PER_LINE)
		this.#currentLineQueue = this.#remainingLines.shift()
		this.#displayedLines = new Array(MAX_LINES).fill(null).map((_) => [])

		this.#animationId = requestAnimationFrame(this.#update)

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	next() {
		// If there are still characters left to type in the current line, do nothing
		if (
			(this.#currentLineQueue && this.#currentLineQueue.length > 0) ||
			this.#lineCursor < MAX_LINES - 1
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
		if (
			time - this.#lastFrameTime <
			(this.#animationIntervalMs || ANIMATION_INTERVAL_MS)
		)
			return
		this.#lastFrameTime = time
		if (
			this.#currentLineQueue?.length === 0 &&
			this.#lineCursor < MAX_LINES - 1
		) {
			this.#lineCursor++
			this.#currentLineQueue = this.#remainingLines?.shift()
		}

		let newChar = this.#currentLineQueue?.shift()

		if (newChar) this.#displayedLines[this.#lineCursor]?.push(newChar)
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
		const posX = this.#boxX + PADDING_X
		for (let y = 0; y < this.#displayedLines.length; y++) {
			const line = this.#displayedLines[y]
			if (!line) continue
			const posY = this.#boxY + PADDING_Y + 8 * y + y * LINE_GAP
			this.#textFx.draw(this.#ctx, line, posX, posY, time)
		}
	}

	#drawBox() {
		this.#ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
		this.#ctx.fillStyle = this.#borderColor
		this.#ctx.fillRect(
			this.#boxX - BOX_OUTLINE,
			this.#boxY - BOX_OUTLINE,
			this.#boxWidth + BOX_OUTLINE * 2,
			this.#boxHeight + BOX_OUTLINE * 2,
		)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(this.#boxX, this.#boxY, this.#boxWidth, this.#boxHeight)
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
