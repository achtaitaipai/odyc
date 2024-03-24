import { createStore } from '../lib/store.js'
import { Position, Tile } from '../types.js'

export type PlayerParams = {
	sprite?: Tile
	position?: Position
}
export const createPlayer = (params: PlayerParams) => {
	const initialSprite = params.sprite ?? null
	const initialPosition = params.position ?? [0, 0]
	let sprite = params.sprite ?? null
	let position = params.position ?? [0, 0]
	let store = createStore({ sprite, position })
	store.subscribe((value) => {
		sprite = value.sprite ?? null
		position = value.position
	})
	const reset = () => {
		store.set({
			sprite: initialSprite,
			position: initialPosition,
		})
	}

	const playerProxy = {
		get sprite() {
			return sprite
		},
		set sprite(value: Tile | null) {
			store.set({
				sprite: value,
				position,
			})
		},
		get position() {
			return position
		},
		set position(value: Position) {
			store.set({
				sprite,
				position: value,
			})
		},
	}
	return { playerProxy, playerStore: store, reset }
}
