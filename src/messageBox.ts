import { Char, TextFx } from './lib'
import { RendererParams } from './renderer'
const ANIMATION_INTERVAL_MS = 30
export type MessageBoxParams = {
	messageBackground: string | number
	messageColor: string | number
	colors: RendererParams['colors']
}

export class MessageBox {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	isOpen = false
	#resolePromise?: () => void

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
		this.#backgroundColor = this.#getColor(params.messageBackground)
		this.#contentColor = this.#getColor(params.messageColor)
		this.#maxCharsPerLine = Math.floor(
			(this.#canvasSize - 2 * this.#paddingX) / 8,
		)
		this.#maxLines = Math.floor(
			this.#canvasSize / (8 + this.#spaceBetweenLines),
		)

		this.#canvas = document.createElement('canvas')
		this.#canvas.style.setProperty('position', 'absolute')
		this.#canvas.style.setProperty('box-sizing', 'border-box')
		this.#canvas.style.setProperty('display', 'none')
		this.#canvas.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvas.getContext('2d')!
		this.#canvas.width = this.#canvasSize
		this.#canvas.height = this.#canvasSize
		this.#canvas.classList.add('odyc-message-canvas')
		this.#textFx = new TextFx('\n', this.#contentColor, this.#configColors)

		this.#resize()
		window.addEventListener('resize', this.#resize)

		document.body.append(this.#canvas)
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

	open(text: string | string[]) {
		this.isOpen = true
		this.#texts = typeof text === 'string' ? [text] : [...text]
		const currentText = this.#texts[this.#cursor]
		if (!currentText) return
		this.#displayedLines = this.#textFx.parseText(
			currentText,
			this.#maxCharsPerLine,
		)
		this.#canvas.style.removeProperty('display')
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
		if (time - this.#lastFrameTime < ANIMATION_INTERVAL_MS) return
		this.#render(time)
	}

	#render(time: number) {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#contentColor

		const lineCount = Math.min(this.#displayedLines.length, this.#maxLines)

		const textHeight = lineCount * 8 + (lineCount - 1) * this.#spaceBetweenLines
		const top = (this.#canvas.height - textHeight) * 0.5
		for (let i = 0; i < lineCount; i++) {
			const line = this.#displayedLines[i]
			if (!line) continue
			const lineWidth = line.length * 8
			const posX = (this.#canvas.width - lineWidth) * 0.5
			const posY = top + i * 8 + i * this.#spaceBetweenLines
			this.#textFx.draw(this.#ctx, line, posX, posY, time)
		}
	}

	close = () => {
		this.#cursor = 0
		this.#displayedLines = []
		this.isOpen = false
		if (this.#animationId) cancelAnimationFrame(this.#animationId)
		this.#canvas.style.setProperty('display', 'none')
		this.#resolePromise?.()
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initMessageBox = (params: MessageBoxParams) =>
	new MessageBox(params)
