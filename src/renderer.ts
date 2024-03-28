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
	screenWidth: number
	screenHeight: number
	cellWidth: number
	cellHeight: number
	colors: string[]
	ctx: CanvasRenderingContext2D
	background?: string | number

	constructor(options: RendererParams, wrapper: HTMLElement) {
		this.screenWidth = options.screenWidth
		this.screenHeight = options.screenHeight
		this.cellWidth = options.cellWidth
		this.cellHeight = options.cellHeight
		this.colors = options.colors
		this.background = options.background

		const canvas = document.createElement('canvas')
		canvas.classList.add('odyc_canvas')
		canvas.width = this.cellWidth * options.screenWidth
		canvas.height = this.cellHeight * options.screenHeight
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
			const screenPosX = (tileX - cameraX) * this.cellWidth
			const screenPosY = (tileY - cameraY) * this.cellHeight
			this.drawTile(item.sprite, screenPosX, screenPosY)
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
		if (this.background === undefined) return
		for (let y = 0; y < this.screenHeight; y++) {
			for (let x = 0; x < this.screenWidth; x++) {
				this.drawTile(this.background, x * this.cellWidth, y * this.cellHeight)
			}
		}
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
				Math.floor(screenPosX),
				Math.floor(screenPosY),
				this.cellWidth,
				this.cellHeight,
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
