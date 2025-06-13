import { createGame } from './createGame.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'
import { type ActorFacade } from './gameState/actorFacade.js'

export { createSound }
export { createGame }
export type { ActorFacade as EventTarget, Template }
