import { createStore } from '../lib/store.js'
import { Position, Tile } from '../types.js'

export type PlayerParams = {
	sprite?: Tile
	position?: Position
}
export const createPlayer = (params: PlayerParams) => {
	let savedSprite = params.sprite ?? null
	let savedPosition = params.position ?? [0, 0]
	let sprite = params.sprite ?? null
	let position = params.position ?? [0, 0]
	let store = createStore({ sprite, position })
	store.subscribe((value) => {
		sprite = value.sprite ?? null
		position = value.position
	})
	const restoreSavedState = () => {
		store.set({
			sprite: savedSprite,
			position: savedPosition,
		})
	}
	const saveCurrentState = () => {
		savedSprite = sprite
		savedPosition = [...position]
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
	return {
		playerProxy,
		playerStore: store,
		restoreSavedState,
		saveCurrentState,
	}
}
