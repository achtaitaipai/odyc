import { createObservable, Observable } from '../lib/observer.js'
import { Position, Tile } from '../types.js'

export type PlayerParams = {
	sprite?: Tile
	position?: Position
}

export class Player {
	#savedSprite: Tile | null
	#savedPosition: Position
	#sprite: Tile | null
	#position: Position
	#observable: Observable

	constructor(params: PlayerParams) {
		this.#savedSprite = params.sprite ?? null
		this.#savedPosition = params.position ?? [0, 0]
		this.#sprite = params.sprite ?? null
		this.#position = params.position ?? [0, 0]
		this.#observable = createObservable()
	}

	subscribe(callback: () => void) {
		return this.#observable.subscribe(callback)
	}

	saveCurrentState() {
		this.#savedSprite = this.#sprite
		this.#savedPosition = [...this.#position]
	}

	restoreSavedState() {
		this.#sprite = this.#savedSprite
		this.#position = [...this.#savedPosition]
		this.#observable.notify()
	}

	get sprite() {
		return this.#sprite
	}

	get position() {
		return this.#position
	}

	set sprite(value: Tile | null) {
		this.#sprite = value
		this.#observable.notify()
	}

	set position(value: Position) {
		this.#position = [...value]
		this.#observable.notify()
	}

	get facade() {
		const self = this
		return {
			get sprite() {
				return self.sprite
			},
			set sprite(value: Tile | null) {
				self.sprite = value
			},
			get position() {
				return self.position
			},
			set position(value: Position) {
				self.position = value
			},
		}
	}
}
