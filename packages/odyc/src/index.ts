import { createGame } from './createGame.js'
import { type CellFacade } from './gameState/cellFacade.js'
import { Template } from './gameState/types.js'
import { createSound } from './sound.js'

// Global constants injected at build time by tsup
declare const __GIT_HASH__: string
declare const __PACKAGE_VERSION__: string

export * from './helpers'
export { createGame, createSound }

export type { CellFacade as Cell, Template }

// Build information available at runtime
export const __BUILD_INFO__ = {
	gitHash: __GIT_HASH__,
	version: __PACKAGE_VERSION__,
} as const
