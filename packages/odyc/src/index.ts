import { createGame } from './createGame.js'
import { type CellFacade } from './gameState/cellFacade.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'

export * from './helpers'
export { createGame, createSound }

export type { CellFacade as EventTarget, Template }
