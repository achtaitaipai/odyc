import { Store } from '../lib/store.js'
import { Uniforms } from '../shaders/filterSettings.js'
import { GameMap } from './gameMap.js'
import { createActorsStore } from './actors.js'
import { createUniformsStore } from './filterUniforms.js'
import { Player } from './player.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	gameMap: GameMap
	player: Player
	actors: ReturnType<typeof createActorsStore<T>>
	uniformsStore: Store<Uniforms>
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const gameMap = new GameMap(params.map)
	const uniformsStore = createUniformsStore(params.filter?.settings ?? {})
	const player = new Player(params.player)
	const actors = createActorsStore<U>(params, gameMap)

	return {
		player,
		actors,
		gameMap,
		uniformsStore,
	}
}
