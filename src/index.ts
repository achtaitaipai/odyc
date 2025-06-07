import { createGame } from './createGame.js'
import type { Actor } from './gameState/actorProxy.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'

export { createSound }
export { createGame }
export type { Actor as EventTarget, Template }
