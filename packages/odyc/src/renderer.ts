import { Camera } from './camera'
import { Canvas, getCanvas } from './canvas'
import { RENDERER_CANVAS_ID } from './consts'
import { Player } from './gameState/player'
import { CellState } from './gameState/types'
import {
	createGridFromString,
	resolveColor as getColorFromPalette,
} from './lib'
import { Position, Tile } from './types.js'

export type Drawable = {
	sprite?: Tile | null
	position: Position
	visible?: boolean | null
}

/**
 * Renderer configuration parameters
 */
export type RendererParams = {
	/** Width of each cell/sprite in pixels */
	cellWidth: number
	/** Height of each cell/sprite in pixels */
	cellHeight: number
	/** Screen width measured in cells */
	screenWidth: number
	/** Screen height measured in cells */
	screenHeight: number
	/** Color palette array - supports up to 62 colors */
	colors: string[]
	/** Background color (color index or CSS color) */
	background?: string | number
}

class Renderer {
	canvas: Canvas
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

		this.canvas = getCanvas({ id: RENDERER_CANVAS_ID })
		this.canvas.show()

		this.ctx = this.canvas.get2dCtx()
	}

	render<T extends string>(
		player: Player,
		cells: CellState<T>[],
		camera: Camera,
	) {
		this.clear()

		let playerIsDraw = false
		for (const cell of cells) {
			if (
				cell.foreground &&
				cell.position[0] === player.position[0] &&
				cell.position[1] === player.position[1]
			) {
				if (player.visible) {
					this.#drawTile(player, camera)
				}

				this.#drawTile(cell, camera)
				playerIsDraw = true
			} else this.#drawTile(cell, camera)
		}
		if (!playerIsDraw) this.#drawTile(player, camera)
	}

	clear(color?: number | string) {
		this.canvas.setSize(
			this.cellWidth * this.screenWidth * this.#zoom,
			this.cellHeight * this.screenHeight * this.#zoom,
		)
		const background = color ?? this.background
		if (background === undefined || null) return
		if (typeof this.background === 'number')
			this.ctx.fillStyle =
				this.colors[this.background] ?? this.colors[0] ?? 'black'
		else this.ctx.fillStyle = getColorFromPalette(background, this.colors)
		this.ctx.fillRect(
			0,
			0,
			this.screenWidth * this.cellWidth * this.#zoom,
			this.screenHeight * this.cellHeight * this.#zoom,
		)
	}

	#drawTile(item: Drawable, camera: Camera) {
		if (
			item.sprite === undefined ||
			item.sprite === null ||
			item.visible === false ||
			!camera.isOnScreen(item.position)
		)
			return
		const [tileX, tileY] = item.position
		const [cameraX, cameraY] = camera.position
		const screenPosX = (tileX - cameraX) * this.cellWidth
		const screenPosY = (tileY - cameraY) * this.cellHeight
		if (
			screenPosX + this.cellWidth < 0 ||
			screenPosY + this.cellHeight < 0 ||
			screenPosX > this.screenWidth * this.cellWidth ||
			screenPosY > this.screenHeight * this.cellHeight
		)
			return

		const sprite = item.sprite

		if (typeof sprite === 'number' || sprite.length === 1) {
			const color = getColorFromPalette(sprite, this.colors)
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
		const grid = createGridFromString(sprite)
		for (let y = 0; y < this.cellHeight; y++) {
			for (let x = 0; x < this.cellWidth; x++) {
				const char = grid[y]?.charAt(x)
				if (!char) continue
				const color = getColorFromPalette(char, this.colors)
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
export type { Renderer }
