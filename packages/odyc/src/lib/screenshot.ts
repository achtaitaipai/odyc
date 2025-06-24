import {
	DIALOG_CANVAS_ID,
	FILTER_CANVAS_ID,
	MESSAGE_CANVAS_ID,
	PROMPT_CANVAS_ID,
	RENDERER_CANVAS_ID,
} from '../consts'

export class Screenshot {
	canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D

	constructor() {
		this.canvas = document.createElement('canvas')
		this.#ctx = this.canvas.getContext('2d')!
		if (!this.#ctx) {
			throw new Error('Failed to get 2D context for screenshot canvas')
		}

		this.update()
	}

	update() {
		const rendererCanvas = document.querySelector<HTMLCanvasElement>(
			`canvas.${RENDERER_CANVAS_ID}`,
		)
		const dialogCanvas = document.querySelector<HTMLCanvasElement>(
			`canvas.${DIALOG_CANVAS_ID}`,
		)
		const promptCanvas = document.querySelector<HTMLCanvasElement>(
			`canvas.${PROMPT_CANVAS_ID}`,
		)
		const messageCanvas = document.querySelector<HTMLCanvasElement>(
			`canvas.${MESSAGE_CANVAS_ID}`,
		)
		const filterCanvas = document.querySelector<HTMLCanvasElement>(
			`canvas.${FILTER_CANVAS_ID}`,
		)

		const allCanvases: HTMLCanvasElement[] = []
		if (rendererCanvas) allCanvases.push(rendererCanvas)
		if (dialogCanvas) allCanvases.push(dialogCanvas)
		if (promptCanvas) allCanvases.push(promptCanvas)
		if (messageCanvas) allCanvases.push(messageCanvas)
		if (filterCanvas) allCanvases.push(filterCanvas)

		let maxSize = 0
		allCanvases.forEach((canvas) => {
			maxSize = Math.max(maxSize, canvas.width, canvas.height)
		})

		const visibleFrames: HTMLCanvasElement[] = []

		if (filterCanvas && filterCanvas.style.display !== 'none') {
			const canvas2d = this.#glCanvasTo2dCanvas(filterCanvas)
			visibleFrames.push(canvas2d)
		} else if (rendererCanvas) {
			visibleFrames.push(rendererCanvas)
		}

		if (dialogCanvas && dialogCanvas.style.display !== 'none')
			visibleFrames.push(dialogCanvas)
		if (promptCanvas && promptCanvas.style.display !== 'none')
			visibleFrames.push(promptCanvas)
		if (messageCanvas && messageCanvas.style.display !== 'none')
			visibleFrames.push(messageCanvas)

		if (visibleFrames.length === 0) {
			throw new Error('No visible canvas frames found for screenshot')
		}

		this.canvas.width = maxSize
		this.canvas.height = maxSize

		const backgroundColor =
			getComputedStyle(document.body).backgroundColor || 'black'
		this.#ctx.fillStyle = backgroundColor
		this.#ctx.fillRect(0, 0, maxSize, maxSize)

		this.#ctx.imageSmoothingEnabled = false

		visibleFrames.forEach((canvas) => {
			const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height)
			const scaledWidth = canvas.width * scale
			const scaledHeight = canvas.height * scale

			const x = (maxSize - scaledWidth) / 2
			const y = (maxSize - scaledHeight) / 2

			this.#ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight)
		})
	}

	save(filename: string) {
		const dataURL = this.canvas.toDataURL('image/png')
		const link = document.createElement('a')
		link.href = dataURL
		link.download = `${filename}.png`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	get dataUrl(): string {
		return this.canvas.toDataURL('image/png')
	}

	#glCanvasTo2dCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
		const gl = canvas.getContext('webgl', {
			preserveDrawingBuffer: true,
		})
		const w = canvas.width,
			h = canvas.height
		const pixels = new Uint8Array(w * h * 4)
		gl?.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

		const rowSize = w * 4
		const tempRow = new Uint8Array(rowSize)
		for (let y = 0; y < h / 2; y++) {
			const topOffset = y * rowSize
			const bottomOffset = (h - y - 1) * rowSize
			tempRow.set(pixels.subarray(topOffset, topOffset + rowSize))
			pixels.copyWithin(topOffset, bottomOffset, bottomOffset + rowSize)
			pixels.set(tempRow, bottomOffset)
		}
		const imgData = new ImageData(new Uint8ClampedArray(pixels), w, h)
		const copyCanvas = document.createElement('canvas')
		copyCanvas.width = w
		copyCanvas.height = h
		const ctx = copyCanvas.getContext('2d')
		ctx?.putImageData(imgData, 0, 0)
		return copyCanvas
	}
}
