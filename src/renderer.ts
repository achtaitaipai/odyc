import { createGridFromString } from './lib'
import { Position, Tile } from './types.js'

export type Drawable = {
	sprite?: Tile | null
	position: Position
	visible?: boolean | null
}

export type RendererParams = {
	tileWidth: number
	tileHeight: number
	screenWidth: number
	screenHeight: number
	colors: string[]
	background?: string | number
}

class Renderer {
	screenWidth: number
	screenHeight: number
	tileWidth: number
	tileHeight: number
	colors: string[]
	ctx: CanvasRenderingContext2D
	background?: string | number

	constructor(options: RendererParams, wrapper: HTMLElement) {
		this.screenWidth = options.screenWidth
		this.screenHeight = options.screenHeight
		this.tileWidth = options.tileWidth
		this.tileHeight = options.tileHeight
		this.colors = options.colors
		this.background = options.background

		const canvas = document.createElement('canvas')
		canvas.classList.add('odyc_canvas')
		canvas.width = this.tileWidth * options.screenWidth
		canvas.height = this.tileHeight * options.screenHeight
		const orientation = canvas.width < canvas.height ? 'vertical' : 'horizontal'
		canvas.setAttribute('data-orientation', orientation)
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('failled to access context of the canvas')
		this.ctx = ctx
		wrapper.append(canvas)
	}
	render(items: Drawable[], cameraPosition: Position) {
		this.clear()
		const [cameraX, cameraY] = cameraPosition

		for (const item of items) {
			if (item.sprite === undefined || item.sprite === null) continue
			if (item.visible === false) continue
			const [tileX, tileY] = item.position
			const screenPosX = (tileX - cameraX) * this.tileWidth
			const screenPosY = (tileY - cameraY) * this.tileHeight
			this.drawTile(item.sprite, screenPosX, screenPosY)
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
		if (this.background === undefined) return
		for (let y = 0; y < this.screenHeight; y++) {
			for (let x = 0; x < this.screenWidth; x++) {
				this.drawTile(this.background, x * this.tileWidth, y * this.tileHeight)
			}
		}
	}

	drawTile(tile: Tile, screenPosX: number, screenPosY: number) {
		if (
			screenPosX + this.tileWidth < 0 ||
			screenPosY + this.tileHeight < 0 ||
			screenPosX > this.screenWidth * this.tileWidth ||
			screenPosY > this.screenHeight * this.tileHeight
		)
			return

		if (typeof tile === 'number') {
			const color = this.colors[tile]
			if (!color) return
			this.ctx.fillStyle = color
			this.ctx.fillRect(
				Math.floor(screenPosX),
				Math.floor(screenPosY),
				this.tileWidth,
				this.tileHeight,
			)
			return
		}
		const grid = createGridFromString(tile)
		for (let y = 0; y < this.tileHeight; y++) {
			for (let x = 0; x < this.tileWidth; x++) {
				const char = grid[y]?.charAt(x)
				if (!char) continue
				const index = +char
				if (isNaN(index)) continue
				const color = this.colors[index]
				if (!color) continue
				this.ctx.fillStyle = color
				this.ctx.fillRect(
					Math.floor(screenPosX + x),
					Math.floor(screenPosY + y),
					1,
					1,
				)
			}
		}
	}
}

export const initRenderer = (options: RendererParams, wrapper: HTMLElement) =>
	new Renderer(options, wrapper)
