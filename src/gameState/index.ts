import { Store } from '../lib/store.js'
import { Position, Tile } from '../types.js'
import { createActorsStore } from './actors.js'
import { createMapStore } from './map.js'
import { createPlayer } from './player.js'
import { GameStateParams, Templates } from './types.js'

export type GameState<T extends Templates> = {
  mapStore: {
    store: Store<string>;
    getDimensions(): Position;
  },
  player: {
    playerProxy: {
      sprite: Tile | null;
      position: Position;
    };
    playerStore: Store<{
      sprite: Tile | null;
      position: Position;
    }>;
    restoreSavedState: () => void;
    saveCurrentState: () => void;

  },
  actors: ReturnType<typeof createActorsStore<T>>
}

export const initGameState = <U extends Templates>(
  params: GameStateParams<U>,
): GameState<U> => {
  const mapStore = createMapStore(params.map)
  const player = createPlayer(params.player)
  const actors = createActorsStore<U>(params, mapStore)

  return {
    player,
    actors,
    mapStore,
  }
}
