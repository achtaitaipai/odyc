import { createGame } from './createGame.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'
import { type ActorFacade } from './gameState/actorFacade.js'
import { charToSprite } from './helpers.js'

export { createSound, createGame, charToSprite }

export type { ActorFacade as EventTarget, Template }
