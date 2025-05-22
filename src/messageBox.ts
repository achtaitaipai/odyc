import { chunkText, drawText } from './lib'

export type MessageBoxParams = {
	messageBackground: string
	messageColor: string
}

export class MessageBox {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	isOpen = false
	#resolePromise?: () => void

	#text: string[] = []
	#cursor = 0

	//style
	#backgroundColor: string
	#color: string
	#canvasSize = 192
	#paddingX = 2
	#spaceBetweenLines = 2

	constructor(params: MessageBoxParams) {
		this.#backgroundColor = params.messageBackground
		this.#color = params.messageColor
		this.#canvas = document.createElement('canvas')
		this.#canvas.style.setProperty('position', 'absolute')
		this.#canvas.style.setProperty('box-sizing', 'border-box')
		this.#canvas.style.setProperty('display', 'none')
		this.#canvas.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvas.getContext('2d')!
		this.#canvas.width = this.#canvasSize
		this.#canvas.height = this.#canvasSize
		this.#canvas.classList.add('odyc-message-canvas')

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
		this.#text = typeof text === 'string' ? [text] : [...text]
		const currentText = this.#text[this.#cursor]
		if (!currentText) return
		this.#canvas.style.removeProperty('display')
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
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
		const lineLength = (this.#canvasSize - 2 * this.#paddingX) / 8
		const lines = chunkText(text, lineLength)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#color

		const textHeight =
			lines.length * 8 + (lines.length - 1) * this.#spaceBetweenLines
		const top = (this.#canvas.height - textHeight) * 0.5
		lines.forEach((line, i) => {
			const lineWidth = line.replace(/\s+$/, '').length * 8
			const posX = (this.#canvas.width - lineWidth) * 0.5
			const posY =
				top +
				i * 8 +
				i * this.#spaceBetweenLines +
				(lines.length % 2 === 0 ? 0 : 0)
			drawText(this.#ctx, line, posX, posY)
		})
	}

	close = () => {
		this.#cursor = 0
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#resolePromise?.()
	}
}

export const initMessageBox = (params: MessageBoxParams) =>
	new MessageBox(params)
