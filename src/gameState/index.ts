import { createGridFromString, getGridSize } from '../lib/index.js'
import { createActorsStore } from './actors.js'
import { createCounts } from './counts.js'
import { createPlayer } from './player.js'
import { GameStateParams, Templates } from './types.js'

export type GameState<T extends Templates> = ReturnType<typeof initGameState<T>>

export const initGameState = <U extends Templates>(
	params: GameStateParams<U>,
) => {
	const mapDimensions = getGridSize(createGridFromString(params.map))
	const player = createPlayer(params.player)
	const actors = createActorsStore<U>(params)
	const counts = createCounts<U>(params)

	return {
		player,
		mapDimensions,
		counts,
		actors,
	}
}
