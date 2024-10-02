import { drawText } from './lib/renderText.js'
import { chunkText } from './lib/string.js'

export type MessageBoxParams = {
	messageBackground: string
	messageColor: string
}

export class MessageBox {
	#canvasElement: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	isOpen = false
	#resolePromise?: () => void

	#text: string[] = []
	#cursor = 0

	//style
	#backgroundColor: string
	#color: string
	#sideSize = 192
	#paddingX = 8
	#spaceBetweenLines = 2

	constructor(params: MessageBoxParams) {
		this.#backgroundColor = params.messageBackground
		this.#color = params.messageColor
		this.#canvasElement = document.createElement('canvas')
		this.#canvasElement.style.setProperty('position', 'absolute')
		this.#canvasElement.style.setProperty('box-sizing', 'border-box')
		this.#canvasElement.style.setProperty('display', 'none')
		this.#canvasElement.style.setProperty('image-rendering', 'crisp-edges')
		this.#canvasElement.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvasElement.getContext('2d')!
		this.#canvasElement.width = this.#sideSize
		this.#canvasElement.height = this.#sideSize

		this.#resize()
		window.addEventListener('resize', this.#resize)

		document.body.append(this.#canvasElement)
	}

	#resize = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this.#canvasElement.style.setProperty('width', `${sideSize}px`)
		this.#canvasElement.style.setProperty('height', `${sideSize}px`)
		this.#canvasElement.style.setProperty('left', `${left}px`)
		this.#canvasElement.style.setProperty('top', `${top}px`)
	}

	open(text: string | string[]) {
		this.isOpen = true
		this.#text = typeof text === 'string' ? [text] : [...text]
		const currentText = this.#text[this.#cursor]
		if (!currentText) return
		this.#canvasElement.style.removeProperty('display')
		this.#render(currentText)
		return new Promise<void>((res) => (this.#resolePromise = () => res()))
	}

	next() {
		this.#cursor++
		const currentText = this.#text[this.#cursor]
		if (!currentText) this.close()
		else this.#render(currentText)
	}

	#render(text: string) {
		this.#ctx.clearRect(
			0,
			0,
			this.#canvasElement.width,
			this.#canvasElement.height,
		)
		const lineLength = (this.#sideSize - 2 * this.#paddingX) / 8
		const lines = chunkText(text, lineLength)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(
			0,
			0,
			this.#canvasElement.width,
			this.#canvasElement.height,
		)
		this.#ctx.fillStyle = this.#color

		const textHeight =
			lines.length * 8 + (lines.length - 1) * this.#spaceBetweenLines
		const top = (this.#canvasElement.height - textHeight) * 0.5
		lines.forEach((line, i) => {
			const lineWidth = line.length * 8
			const posX = (this.#canvasElement.width - lineWidth) * 0.5
			const posY = top + i * 8 + i * this.#spaceBetweenLines
			drawText(this.#ctx, line, posX, posY)
		})
	}

	close = () => {
		this.#cursor = 0
		this.isOpen = false
		this.#canvasElement.style.setProperty('display', 'none')
		this.#resolePromise?.()
	}
}

export const initMessageBox = (params: MessageBoxParams) =>
	new MessageBox(params)
