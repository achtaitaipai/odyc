import { Canvas } from './canvas'
import {
	Char,
	getColorFrompalette,
	getColorFrompalette as getColorFromPalette,
	TextFx,
} from './lib'
import { RendererParams } from './renderer'
const ANIMATION_INTERVAL_MS = 30
export type MessageBoxParams = {
	messageBackground: string | number
	messageColor: string | number
	messageInternvalMs?: number
	colors: RendererParams['colors']
}

export class MessageBox {
	#canvas: Canvas
	#ctx: CanvasRenderingContext2D
	isOpen = false
	#resolePromise?: () => void

	#texts: string[] = []
	#displayedLines: Char[][] = []
	#maxCharsPerLine: number
	#maxLines: number
	#cursor = 0

	#animationIntervalMs?: number

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
		this.#backgroundColor = getColorFromPalette(
			params.messageBackground,
			params.colors,
		)
		this.#contentColor = getColorFrompalette(params.messageColor, params.colors)
		this.#maxCharsPerLine = Math.floor(
			(this.#canvasSize - 2 * this.#paddingX) / 8,
		)
		this.#maxLines = Math.floor(
			this.#canvasSize / (8 + this.#spaceBetweenLines),
		)
		this.#animationIntervalMs = params.messageInternvalMs

		this.#canvas = new Canvas({ id: 'odyc-message-canvas', zIndex: 10 })
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
		this.#animationId = requestAnimationFrame(this.#update)
		return new Promise<void>((res) => (this.#resolePromise = () => res()))
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

	#update = (time: number) => {
		this.#animationId = requestAnimationFrame(this.#update)
		if (
			time - this.#lastFrameTime <
			(this.#animationIntervalMs || ANIMATION_INTERVAL_MS)
		)
			return
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
		this.#resolePromise?.()
	}
}

export const initMessageBox = (params: MessageBoxParams) =>
	new MessageBox(params)
