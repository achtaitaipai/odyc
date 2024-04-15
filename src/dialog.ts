import { drawText } from './lib/renderText.js'
import { chunkText } from './lib/string.js'

export type DialogParams = {
	dialogBackground: string
	dialogColor: string
}

export class Dialog {
	private _canvasElement: HTMLCanvasElement
	private _ctx: CanvasRenderingContext2D
	private _resolvePromise?: () => void
	private _text?: string[]
	private _lines: string[] = []
	private _lineCursor = 0
	private _currentChunk?: string[]
	private _requestAnimationFrameId?: number
	private _lastTime = 0
	private _timeBetweenChar = 50

	isOpen = false

	//style
	private _numberOfLines = 2
	private _backgroundColor: string
	private _color: string
	private _charsByLine = 20
	private _spaceBetweenLines = 8
	private _paddingY = 8
	private _paddingX = 8

	private _boxHeight: number
	private _boxWidth: number
	private _boxX: number
	private _boxY: number

	constructor(params: DialogParams) {
		this._backgroundColor = params.dialogBackground
		this._color = params.dialogColor
		this._canvasElement = document.createElement('canvas')
		this._canvasElement.style.setProperty('position', 'absolute')
		this._canvasElement.style.setProperty('box-sizing', 'border-box')
		this._canvasElement.style.setProperty('display', 'none')
		this._canvasElement.style.setProperty('image-rendering', 'crisp-edges')
		this._canvasElement.style.setProperty('image-rendering', 'pixelated')
		this._ctx = this._canvasElement.getContext('2d')!
		this._canvasElement.width = 256
		this._canvasElement.height = 256

		this._resize()
		document.body.append(this._canvasElement)
		window.addEventListener('resize', this._resize)

		this._boxHeight =
			this._numberOfLines * 8 +
			this._paddingY * 2 +
			this._spaceBetweenLines * (this._numberOfLines - 1)
		this._boxY = this._canvasElement.height - this._boxHeight - 16
		this._boxWidth = this._charsByLine * 8 + this._paddingX * 2
		this._boxX = (this._canvasElement.width - this._boxWidth) * 0.5
	}

	async open(text: string) {
		this._canvasElement.style.setProperty('display', 'block')
		this._text = chunkText(text, this._charsByLine)
		this._currentChunk = this._text.shift()?.split('')
		this._requestAnimationFrameId = requestAnimationFrame(this._update)
		this.isOpen = true
		this._lines = new Array(this._numberOfLines).fill('')
		this._render()

		return new Promise<void>((res) => {
			this._resolvePromise = () => res()
		})
	}

	next() {
		if (!this.isOpen) return
		if (this._currentChunk?.length === 0 || this._currentChunk === undefined) {
			this._currentChunk = this._text?.shift()?.split('')
			if (this._currentChunk === undefined) {
				this._close()
				return
			}
			this._lineCursor++

			if (this._lineCursor >= this._numberOfLines) {
				this._lineCursor = 0
				this._lines = this._lines.map(() => '')
				this._render()
			}
		}
	}

	private _update = (now: number) => {
		this._requestAnimationFrameId = requestAnimationFrame(this._update)
		if (now - this._lastTime < this._timeBetweenChar) return
		this._lastTime = now
		if (
			this._currentChunk?.length === 0 &&
			this._lineCursor < this._numberOfLines - 1
		) {
			this._lineCursor++
			this._currentChunk = this._text?.shift()?.split('')
		}

		const newChar = this._currentChunk?.shift()
		this._ctx.fillStyle = this._color
		if (newChar) {
			this._lines[this._lineCursor] = this._lines[this._lineCursor] + newChar
			this._render()
		}
	}

	private _close() {
		this.isOpen = false
		this._canvasElement.style.setProperty('display', 'none')
		this._lineCursor = 0
		this._resolvePromise?.()
		this._requestAnimationFrameId &&
			cancelAnimationFrame(this._requestAnimationFrameId)
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

	private _render = () => {
		this._ctx.clearRect(
			0,
			0,
			this._canvasElement.width,
			this._canvasElement.height,
		)
		this._ctx.fillStyle = this._backgroundColor
		this._ctx.fillRect(this._boxX, this._boxY, this._boxWidth, this._boxHeight)
		this._ctx.fillStyle = this._color
		for (let x = 0; x < this._boxWidth; x++) {
			this._ctx.fillRect(this._boxX + x, this._boxY, 1, 1)
			this._ctx.fillRect(this._boxX + x, this._boxY + this._boxHeight - 1, 1, 1)
		}
		for (let y = 0; y < this._boxHeight; y++) {
			this._ctx.fillRect(this._boxX, this._boxY + y, 1, 1)
			this._ctx.fillRect(this._boxX + this._boxWidth - 1, this._boxY + y, 1, 1)
		}
		this._ctx.fillStyle = this._color
		this._lines.forEach((line, i) => {
			const x = this._boxX + this._paddingX
			const y =
				this._boxY + this._paddingY + 8 * i + i * this._spaceBetweenLines
			drawText(this._ctx, line, x, y)
		})
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
