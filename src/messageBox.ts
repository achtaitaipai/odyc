import { drawText } from './lib/renderText.js'
import { chunkText } from './lib/string.js'

export class MessageBox {
	private _canvasElement: HTMLCanvasElement
	private _ctx: CanvasRenderingContext2D
	isOpen = false
	private _resolePromise?: () => void

	private _text: string[] = []
	private _cursor = 0

	//style
	private _backgroundColor = '#212529'
	private _color = '#f8f9fa'
	private _sideSize = 192
	private _paddingX = 8
	private _spaceBetweenLines = 2

	constructor() {
		this._canvasElement = document.createElement('canvas')
		this._canvasElement.style.setProperty('position', 'absolute')
		this._canvasElement.style.setProperty('box-sizing', 'border-box')
		this._canvasElement.style.setProperty('display', 'none')
		this._canvasElement.style.setProperty('image-rendering', 'crisp-edges')
		this._canvasElement.style.setProperty('image-rendering', 'pixelated')
		this._ctx = this._canvasElement.getContext('2d')!
		this._canvasElement.width = this._sideSize
		this._canvasElement.height = this._sideSize

		this._resize()
		window.addEventListener('resize', this._resize)

		document.body.append(this._canvasElement)
	}

	private _resize = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight) * 0.9
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this._canvasElement.style.setProperty('width', `${sideSize}px`)
		this._canvasElement.style.setProperty('height', `${sideSize}px`)
		this._canvasElement.style.setProperty('left', `${left}px`)
		this._canvasElement.style.setProperty('top', `${top}px`)
	}

	open(text: string | string[]) {
		this.isOpen = true
		this._text = typeof text === 'string' ? [text] : [...text]
		const currentText = this._text[this._cursor]
		console.log(currentText)
		if (!currentText) return
		this._canvasElement.style.removeProperty('display')
		this._render(currentText)
		return new Promise<void>((res) => (this._resolePromise = () => res()))
	}

	next() {
		this._cursor++
		const currentText = this._text[this._cursor]
		if (!currentText) this.close()
		else this._render(currentText)
	}

	private _render(text: string) {
		const lineLength = (this._sideSize - 2 * this._paddingX) / 8
		const lines = chunkText(text, lineLength)
		this._ctx.fillStyle = this._backgroundColor
		this._ctx.fillRect(
			0,
			0,
			this._canvasElement.width,
			this._canvasElement.height,
		)
		this._ctx.fillStyle = this._color

		const textHeight =
			lines.length * 8 + (lines.length - 1) * this._spaceBetweenLines
		const top = (this._canvasElement.height - textHeight) * 0.5
		lines.forEach((line, i) => {
			const lineWidth = line.length * 8
			const posX = (this._canvasElement.width - lineWidth) * 0.5
			const posY = top + i * 8 + i * this._spaceBetweenLines
			drawText(this._ctx, line, posX, posY)
		})
	}

	close = () => {
		this._cursor = 0
		this.isOpen = false
		this._canvasElement.style.setProperty('display', 'none')
		this._resolePromise?.()
	}
}

export const initMessageBox = () => new MessageBox()
