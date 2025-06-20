import { GameStateParams } from './gameState/types.js'
import { RendererParams } from './renderer.js'
import { Position } from './types.js'

/**
 * Camera configuration parameters
 */
export type CameraParams = {
	/** Camera width constraint */
	cameraWidth?: number
	/** Camera height constraint */
	cameraHeight?: number
	screenWidth: RendererParams['screenWidth']
	screenHeight: RendererParams['screenHeight']
	map: GameStateParams<string>['map']
}
type Rect = {
	left: number
	top: number
	right: number
	bottom: number
}
export class Camera {
	#rect?: Rect
	#width?: number
	#height?: number
	position: Position = [0, 0]
	#screenWidth: number
	#screenHeight: number

	constructor(params: CameraParams) {
		this.#screenWidth = params.screenWidth
		this.#screenHeight = params.screenHeight
		if (params.cameraWidth && params.cameraHeight) {
			this.#width = params.cameraWidth
			this.#height = params.cameraHeight
			this.#rect = {
				left: (params.screenWidth - this.#width) * 0.5,
				right: (params.screenWidth + this.#width) * 0.5 - 1,
				top: (params.screenHeight - this.#height) * 0.5,
				bottom: (params.screenHeight + this.#height) * 0.5 - 1,
			}
		}
	}

	update(target: Position, mapDimensions: Position) {
		const [targetX, targetY] = target
		if (!this.#rect || !this.#screenWidth || !this.#screenHeight) {
			this.position[0] =
				Math.floor(targetX / this.#screenWidth) * this.#screenWidth
			this.position[1] =
				Math.floor(targetY / this.#screenHeight) * this.#screenHeight
			this.#clamp(mapDimensions)
			return
		}

		const [posX, posY] = this.position
		const targetScreenX = targetX - posX
		const targetScreenY = targetY - posY
		if (targetScreenX < this.#rect.left)
			this.position[0] -= this.#rect.left - targetScreenX
		if (targetScreenX > this.#rect.right)
			this.position[0] += targetScreenX - this.#rect.right
		if (targetScreenY < this.#rect.top)
			this.position[1] -= this.#rect.top - targetScreenY
		if (targetScreenY > this.#rect.bottom)
			this.position[1] += targetScreenY - this.#rect.bottom
		this.#clamp(mapDimensions)
	}

	isOnScreen(position: Position) {
		const [posX, posY] = position
		const screenPosX = posX - this.position[0]
		const screenPosY = posY - this.position[1]
		return (
			screenPosX >= 0 &&
			screenPosY >= 0 &&
			screenPosX < this.#screenWidth &&
			screenPosY < this.#screenHeight
		)
	}

	reset() {
		this.position = [0, 0]
	}

	#clamp(mapDimensions: Position) {
		const [worldWidth, worldHeight] = mapDimensions
		this.position[0] = Math.max(
			0,
			Math.min(this.position[0], worldWidth - this.#screenWidth),
		)
		this.position[1] = Math.max(
			0,
			Math.min(this.position[1], worldHeight - this.#screenHeight),
		)
	}
}

export const initCamera = (params: CameraParams) => new Camera(params)
