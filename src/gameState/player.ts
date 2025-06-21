import { Input } from '../inputs.js'
import { createObservable, Observable } from '../lib/observer.js'
import { Position, Tile } from '../types.js'

/**
 * Player configuration parameters
 * @example
 * ```typescript
 * const playerConfig = {
 *   sprite: 0, // Use color index 0
 *   position: [2, 3], // Start at coordinates x=2, y=3
 *   visible: true,
 *   onInput: (input) => {
 *     if (input === 'ACTION') console.log('Player pressed action!');
 *   },
 *   onTurn: (player) => {
 *     // Custom logic executed each turn
 *   }
 * }
 * ```
 */
export type PlayerParams = {
	/** Player sprite - can be a color index (0-9), single character, or multi-line pixel art string */
	sprite?: Tile
	/** Starting position as [x, y] coordinates on the game grid */
	position?: Position
	/** Callback executed at the end of each turn, receives player facade */
	onTurn?: (player: Player['facade']) => any
	/** Callback executed when player receives input, receives the input type */
	onInput?: (input: Input) => any
	/** Whether the player sprite is visible on screen (default: true) */
	visible?: boolean
}

export class Player {
	#savedSprite: Tile | null
	#savedPosition: Position
	#savedVisible: boolean
	#sprite: Tile | null
	#position: Position
	#visible: boolean
	#onTurn?: (target: Player['facade']) => any
	#onInput?: (input: Input) => any
	#observable: Observable
	#direction: Position = [0, 0]

	constructor(params: PlayerParams) {
		this.#savedSprite = params.sprite ?? null
		this.#savedPosition = params.position ?? [0, 0]
		this.#savedVisible = params.visible ?? true
		this.#sprite = params.sprite ?? null
		this.#position = params.position ?? [0, 0]
		this.#visible = params.visible ?? true
		this.#onTurn = params.onTurn
		this.#onInput = params.onInput
		this.#observable = createObservable()
	}

	subscribe(callback: () => void) {
		return this.#observable.subscribe(callback)
	}

	saveCurrentState() {
		this.#savedSprite = this.#sprite
		this.#savedPosition = [...this.#position]
		this.#savedVisible = this.visible
	}

	restoreSavedState() {
		this.#sprite = this.#savedSprite
		this.#position = [...this.#savedPosition]
		this.#visible = this.#savedVisible
		this.#observable.notify()
	}

	dispatchOnTurn() {
		this.#onTurn?.(this.facade)
	}

	dispatchOnInput(input: Input) {
		this.#onInput?.(input)
	}

	get visible() {
		return this.#visible
	}

	set visible(value: boolean) {
		this.#visible = value
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

	get direction() {
		return this.#direction
	}

	setDirection(input: Input) {
		switch (input) {
			case 'LEFT':
				this.#direction = [-1, 0]
				break
			case 'UP':
				this.#direction = [0, -1]
				break
			case 'RIGHT':
				this.#direction = [1, 0]
				break
			case 'DOWN':
				this.#direction = [0, 1]
				break
		}
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
			get direction() {
				return self.direction
			},
			get visible() {
				return self.visible
			},
			set visible(value: boolean) {
				self.visible = value
			},
		}
	}
}
