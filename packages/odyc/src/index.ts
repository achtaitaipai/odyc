import { createGame } from './createGame.js'
import { type ActorFacade } from './gameState/actorFacade.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'

export * from './helpers'
export { createGame, createSound }

export type { ActorFacade as EventTarget, Template }
