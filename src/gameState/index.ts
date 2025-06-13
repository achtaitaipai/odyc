import { Store } from '../lib/store.js'
import { Uniforms } from '../shaders/filterSettings.js'
import { Position } from '../types.js'
import { createActorsStore } from './actors.js'
import { createUniformsStore } from './filterUniforms.js'
import { createMapStore } from './map.js'
import { Player } from './player.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	mapStore: {
		store: Store<string>
		getDimensions(): Position
	}
	player: Player
	actors: ReturnType<typeof createActorsStore<T>>
	uniformsStore: Store<Uniforms>
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const mapStore = createMapStore(params.map)
	const uniformsStore = createUniformsStore(params.filter?.settings ?? {})
	const actors = createActorsStore<U>(params, mapStore)
	const player = new Player(params.player)

	return {
		player,
		actors,
		mapStore,
		uniformsStore,
	}
}
