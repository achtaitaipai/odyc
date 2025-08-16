import { Canvas, getCanvas } from './canvas'
import { TEXT_ANIMATION_INTERVAL_MS, MESSAGE_CANVAS_ID } from './consts'
import { Char, resolveColor, resolveTick, TextFx } from './lib'
import { RendererParams } from './renderer'

/**
 * Message box configuration parameters
 */
export type MessageBoxParams = {
	/** Background color for message box (color index or CSS color) */
	messageBackground: string | number
	/** Text color for message content (color index or CSS color) */
	messageColor: string | number
	colors: RendererParams['colors']
	root?: HTMLElement | string
}

export class MessageBox {
	#canvas: Canvas
	#ctx: CanvasRenderingContext2D
	isOpen = false
	#resolvePromise?: () => void

	#texts: string[] = []
	#displayedLines: Char[][] = []
	#maxCharsPerLine: number
	#maxLines: number
	#cursor = 0

	#animationId?: number
	#lastFrameTime = 0

	#textFx: TextFx

	#configColors: RendererParams['colors']
	//style
	#backgroundColor: string
	#contentColor: string
	#canvasSize = 192
	#paddingX = 1
	#spaceBetweenLines = 2

	constructor(params: MessageBoxParams) {
		this.#configColors = params.colors
		this.#backgroundColor = resolveColor(
			params.messageBackground,
			params.colors,
		)
		this.#contentColor = resolveColor(params.messageColor, params.colors)
		this.#maxCharsPerLine = Math.floor(
			(this.#canvasSize - 2 * this.#paddingX) / 8,
		)
		this.#maxLines = Math.floor(
			this.#canvasSize / (8 + this.#spaceBetweenLines),
		)

		this.#canvas = getCanvas({
			id: MESSAGE_CANVAS_ID,
			zIndex: 10,
			root: params.root,
		})
		this.#canvas.hide()
		this.#ctx = this.#canvas.get2dCtx()
		this.#canvas.setSize(this.#canvasSize, this.#canvasSize)
		this.#textFx = new TextFx('\n', this.#contentColor, this.#configColors)
	}

	open(text: string | string[]) {
		const texts = typeof text === 'string' ? [text] : [...text]
		if (texts.length === 0 || texts[0]?.length === 0) return
		this.isOpen = true
		this.#texts = texts
		const currentText = this.#texts[this.#cursor]
		if (!currentText) return
		this.#displayedLines = this.#textFx.parseText(
			currentText,
			this.#maxCharsPerLine,
		)
		this.#canvas.show()
		this.#update()
		resolveTick()
		return new Promise<void>((res) => (this.#resolvePromise = () => res()))
	}

	next() {
		this.#cursor++
		const currentText = this.#texts[this.#cursor]
		if (!currentText) this.close()
		else {
			this.#displayedLines = this.#textFx.parseText(
				currentText,
				this.#maxCharsPerLine,
			)
			this.#animationId = requestAnimationFrame(this.#update)
		}
	}

	#update = () => {
		const time = performance.now()
		this.#animationId = requestAnimationFrame(this.#update)
		if (time - this.#lastFrameTime < TEXT_ANIMATION_INTERVAL_MS) return
		this.#render(time)
	}

	#render(time: number) {
		this.#ctx.clearRect(0, 0, this.#canvasSize, this.#canvasSize)

		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(0, 0, this.#canvasSize, this.#canvasSize)
		this.#ctx.fillStyle = this.#contentColor

		const lineCount = Math.min(this.#displayedLines.length, this.#maxLines)

		const textHeight = lineCount * 8 + (lineCount - 1) * this.#spaceBetweenLines
		const top = (this.#canvasSize - textHeight) * 0.5
		for (let i = 0; i < lineCount; i++) {
			const line = this.#displayedLines[i]
			if (!line) continue
			const lineWidth = line.length * 8
			const posX = (this.#canvasSize - lineWidth) * 0.5
			const posY = top + i * 8 + i * this.#spaceBetweenLines
			this.#textFx.draw(this.#ctx, line, posX, posY, time)
		}
	}

	close = () => {
		this.#cursor = 0
		this.#displayedLines = []
		this.isOpen = false
		if (this.#animationId) cancelAnimationFrame(this.#animationId)
		this.#canvas.hide()
		this.#resolvePromise?.()
		resolveTick()
	}
}

export const initMessageBox = (params: MessageBoxParams) =>
	new MessageBox(params)
