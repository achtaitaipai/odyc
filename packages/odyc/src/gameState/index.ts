import { createObservable } from '../lib/observer.js'
import { Cells } from './cells.js'
import { FilterUniforms } from './filterUniforms.js'
import { GameMap } from './gameMap.js'
import { Player } from './player.js'
import { Turn } from './turn.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	gameMap: GameMap
	player: Player
	cells: Cells<T>
	filterUniforms: FilterUniforms
	turn: Turn
	subscribe: (callback: () => void) => void
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const gameMap = new GameMap(params.map)
	const filterUniforms = new FilterUniforms(params.filter?.settings ?? {})
	const player = new Player(params.player)
	const cells = new Cells<U>(params, gameMap)
	const turn = new Turn()

	const observable = createObservable()
	filterUniforms.subscribe(() => {
		observable.notify()
	})
	player.subscribe(() => {
		observable.notify()
	})
	cells.subscribe(() => {
		observable.notify()
	})
	gameMap.subscribe(() => {
		observable.notify()
	})

	return {
		player,
		cells,
		gameMap,
		filterUniforms,
		turn,
		subscribe: observable.subscribe,
	}
}
