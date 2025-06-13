import { createActorsStore } from './actors.js'
import { FilterUniforms } from './filterUniforms.js'
import { GameMap } from './gameMap.js'
import { Player } from './player.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	gameMap: GameMap
	player: Player
	actors: ReturnType<typeof createActorsStore<T>>
	filterUniforms: FilterUniforms
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const gameMap = new GameMap(params.map)
	const filterUniforms = new FilterUniforms(params.filter?.settings ?? {})
	const player = new Player(params.player)
	const actors = createActorsStore<U>(params, gameMap)

	return {
		player,
		actors,
		gameMap,
		filterUniforms,
	}
}
