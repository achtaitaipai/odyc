import { Camera } from './camera'
import { createGridFromString } from './lib'
import { Position, Tile } from './types.js'

export type Drawable = {
	sprite?: Tile | null
	position: Position
	visible?: boolean | null
}

export type RendererParams = {
	cellWidth: number
	cellHeight: number
	screenWidth: number
	screenHeight: number
	colors: string[]
	background?: string | number
}

class Renderer {
	canvas: HTMLCanvasElement
	#zoom = 24
	screenWidth: number
	screenHeight: number
	cellWidth: number
	cellHeight: number
	colors: string[]
	ctx: CanvasRenderingContext2D
	background?: string | number

	constructor(options: RendererParams) {
		this.screenWidth = options.screenWidth
		this.screenHeight = options.screenHeight
		this.cellWidth = options.cellWidth
		this.cellHeight = options.cellHeight
		this.colors = options.colors
		this.background = options.background

		this.canvas = document.createElement('canvas')
		this.canvas.width = this.cellWidth * options.screenWidth * this.#zoom
		this.canvas.height = this.cellHeight * options.screenHeight * this.#zoom

		this.canvas.style.setProperty('position', 'absolute')
		this.canvas.style.setProperty('image-rendering', 'pixelated')
		this.canvas.classList.add('odyc-renderer-canvas')
		const ctx = this.canvas.getContext('2d')
		if (!ctx) throw new Error('failled to access context of the canvas')
		this.ctx = ctx
		this.#setSize()
		document.body.append(this.canvas)

		window.addEventListener('resize', this.#setSize)
	}
	#setSize = () => {
		const orientation =
			this.canvas.width < this.canvas.height ? 'vertical' : 'horizontal'
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		let width =
			orientation === 'horizontal'
				? sideSize
				: (sideSize / this.canvas.height) * this.canvas.width
		let height =
			orientation === 'vertical'
				? sideSize
				: (sideSize / this.canvas.width) * this.canvas.height
		const left = (window.innerWidth - width) * 0.5
		const top = (window.innerHeight - height) * 0.5
		this.canvas.style.setProperty('width', `${width}px`)
		this.canvas.style.setProperty('height', `${height}px`)
		this.canvas.style.setProperty('left', `${left}px`)
		this.canvas.style.setProperty('top', `${top}px`)
	}

	render(items: Drawable[], camera: Camera) {
		this.clear()
		const [cameraX, cameraY] = camera.position

		for (const item of items) {
			if (item.sprite === undefined || item.sprite === null) continue
			if (item.visible === false) continue
			const [tileX, tileY] = item.position
			const screenPosX = (tileX - cameraX) * this.cellWidth
			const screenPosY = (tileY - cameraY) * this.cellHeight
			if (camera.isOnScreen(item.position))
				this.drawTile(item.sprite, screenPosX, screenPosY)
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
		if (this.background === undefined) return
		if (typeof this.background === 'number')
			this.ctx.fillStyle =
				this.colors[this.background] ?? this.colors[0] ?? 'black'
		else this.ctx.fillStyle = this.background
		this.ctx.fillRect(
			0,
			0,
			this.screenWidth * this.cellWidth * this.#zoom,
			this.screenHeight * this.cellHeight * this.#zoom,
		)
	}

	drawTile(tile: Tile, screenPosX: number, screenPosY: number) {
		if (
			screenPosX + this.cellWidth < 0 ||
			screenPosY + this.cellHeight < 0 ||
			screenPosX > this.screenWidth * this.cellWidth ||
			screenPosY > this.screenHeight * this.cellHeight
		)
			return

		if (typeof tile === 'number') {
			const color = this.colors[tile]
			if (!color) return
			this.ctx.fillStyle = color
			this.ctx.fillRect(
				Math.floor(screenPosX) * this.#zoom,
				Math.floor(screenPosY) * this.#zoom,
				this.cellWidth * this.#zoom,
				this.cellHeight * this.#zoom,
			)
			return
		}
		const grid = createGridFromString(tile)
		for (let y = 0; y < this.cellHeight; y++) {
			for (let x = 0; x < this.cellWidth; x++) {
				const char = grid[y]?.charAt(x)
				if (!char) continue
				const index = +char
				if (isNaN(index)) continue
				const color = this.colors[index]
				if (!color) continue
				this.ctx.fillStyle = color
				this.ctx.fillRect(
					Math.floor(screenPosX + x) * this.#zoom,
					Math.floor(screenPosY + y) * this.#zoom,
					this.#zoom,
					this.#zoom,
				)
			}
		}
	}
}

export const initRenderer = (options: RendererParams) => new Renderer(options)
