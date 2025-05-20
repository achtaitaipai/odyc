import { drawText } from './font'
import { chunkText } from './lib/string.js'

export type DialogParams = {
	dialogBackground: string
	dialogColor: string
}

export class Dialog {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: () => void
	#text?: string[]
	#lines: string[] = []
	#lineCursor = 0
	#currentChunk?: string[]
	#requestAnimationFrameId?: number
	#lastTime = 0
	#timeBetweenChar = 50

	isOpen = false

	//style
	#numberOfLines = 2
	#backgroundColor: string
	#color: string
	#charsByLine = 20
	#spaceBetweenLines = 8
	#paddingY = 8
	#paddingX = 8

	#boxHeight: number
	#boxWidth: number
	#boxX: number
	#boxY: number

	constructor(params: DialogParams) {
		this.#backgroundColor = params.dialogBackground
		this.#color = params.dialogColor
		this.#canvas = document.createElement('canvas')
		this.#canvas.style.setProperty('position', 'absolute')
		this.#canvas.style.setProperty('box-sizing', 'border-box')
		this.#canvas.style.setProperty('display', 'none')
		this.#canvas.style.setProperty('image-rendering', 'crisp-edges')
		this.#canvas.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvas.getContext('2d')!
		this.#canvas.width = 256
		this.#canvas.height = 256
		this.#canvas.classList.add('odyc-dialog-canvas')

		this.#resize()
		document.body.append(this.#canvas)
		window.addEventListener('resize', this.#resize)

		this.#boxHeight =
			this.#numberOfLines * 8 +
			this.#paddingY * 2 +
			this.#spaceBetweenLines * (this.#numberOfLines - 1)
		this.#boxY = this.#canvas.height - this.#boxHeight - 16
		this.#boxWidth = this.#charsByLine * 8 + this.#paddingX * 2
		this.#boxX = (this.#canvas.width - this.#boxWidth) * 0.5
	}

	async open(text: string) {
		this.#canvas.style.setProperty('display', 'block')
		this.#text = chunkText(text, this.#charsByLine)
		this.#currentChunk = this.#text.shift()?.split('')
		this.#requestAnimationFrameId = requestAnimationFrame(this.#update)
		this.isOpen = true
		this.#lines = new Array(this.#numberOfLines).fill('')
		this.#render()

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	next() {
		if (!this.isOpen) return
		if (this.#currentChunk?.length === 0 || this.#currentChunk === undefined) {
			this.#currentChunk = this.#text?.shift()?.split('')
			if (this.#currentChunk === undefined) {
				this.#close()
				return
			}
			this.#lineCursor++

			if (this.#lineCursor >= this.#numberOfLines) {
				this.#lineCursor = 0
				this.#lines = this.#lines.map(() => '')
				this.#render()
			}
		}
	}

	#update = (now: number) => {
		this.#requestAnimationFrameId = requestAnimationFrame(this.#update)
		if (now - this.#lastTime < this.#timeBetweenChar) return
		this.#lastTime = now
		if (
			this.#currentChunk?.length === 0 &&
			this.#lineCursor < this.#numberOfLines - 1
		) {
			this.#lineCursor++
			this.#currentChunk = this.#text?.shift()?.split('')
		}

		const newChar = this.#currentChunk?.shift()
		this.#ctx.fillStyle = this.#color
		if (newChar) {
			this.#lines[this.#lineCursor] = this.#lines[this.#lineCursor] + newChar
			this.#render()
		}
	}

	#close() {
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#lineCursor = 0
		this.#resolvePromise?.()
		this.#requestAnimationFrameId &&
			cancelAnimationFrame(this.#requestAnimationFrameId)
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

	#render = () => {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(this.#boxX, this.#boxY, this.#boxWidth, this.#boxHeight)
		this.#ctx.fillStyle = this.#color
		for (let x = 0; x < this.#boxWidth; x++) {
			this.#ctx.fillRect(this.#boxX + x, this.#boxY, 1, 1)
			this.#ctx.fillRect(this.#boxX + x, this.#boxY + this.#boxHeight - 1, 1, 1)
		}
		for (let y = 0; y < this.#boxHeight; y++) {
			this.#ctx.fillRect(this.#boxX, this.#boxY + y, 1, 1)
			this.#ctx.fillRect(this.#boxX + this.#boxWidth - 1, this.#boxY + y, 1, 1)
		}
		this.#ctx.fillStyle = this.#color
		this.#lines.forEach((line, i) => {
			const x = this.#boxX + this.#paddingX
			const y =
				this.#boxY + this.#paddingY + 8 * i + i * this.#spaceBetweenLines
			drawText(this.#ctx, line, x, y)
		})
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
