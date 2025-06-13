import { createObservable } from '../lib/observer.js'
import { Actors } from './actors.js'
import { FilterUniforms } from './filterUniforms.js'
import { GameMap } from './gameMap.js'
import { Player } from './player.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	gameMap: GameMap
	player: Player
	actors: Actors<T>
	filterUniforms: FilterUniforms
	subscribe: (callback: () => void) => void
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const gameMap = new GameMap(params.map)
	const filterUniforms = new FilterUniforms(params.filter?.settings ?? {})
	const player = new Player(params.player)
	const actors = new Actors<U>(params, gameMap)

	const observable = createObservable()
	filterUniforms.subscribe(() => {
		observable.notify()
	})
	player.subscribe(() => {
		observable.notify()
	})
	actors.subscribe(() => {
		observable.notify()
	})

	return {
		player,
		actors,
		gameMap,
		filterUniforms,
		subscribe: observable.subscribe,
	}
}
