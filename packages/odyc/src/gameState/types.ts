import { FilterParams } from '../shaders/filterSettings.js'
import { PlaySoundArgs } from '../sound.js'
import { Tile, UnTuplify } from '../types.js'
import { CellFacade } from './cellFacade.js'
import { PlayerParams } from './player.js'

/**
 * Cell templates that define behavior for game entities.
 * Each template corresponds to a character used in the game map string.
 *
 * @template T - String literal type for template keys (map characters)
 * @example
 * ```typescript
 * const templates = {
 *   'x': { // Wall template
 *     solid: true,
 *     sprite: 4,
 *     visible: true
 *   },
 *   'e': { // Enemy template
 *     sprite: 1,
 *     sound: 'hit',
 *     onCollide: (target) => {
 *       target.remove();
 *       // Game logic here
 *     }
 *   },
 *   'd': () => ({ // Dynamic template (function)
 *     sprite: Math.random() > 0.5 ? 2 : 3,
 *     dialog: 'Hello!'
 *   })
 * }
 * ```
 */
export type Templates<T extends string = string> = {
	/** Template can be a function that returns a template (for dynamic behavior) or a static template object */
	[K in T]: (() => Template<K>) | Template<K>
}

/**
 * Template defining cell behavior and properties.
 * All properties are optional and define how cells behave in the game.
 *
 * @template T - String literal type for template key
 * @example
 * ```typescript
 * const doorTemplate: Template<'d'> = {
 *   solid: true,
 *   sprite: 5,
 *   dialog: 'A locked door',
 *   onEnter: (cell) => {
 *     if (hasKey()) {
 *       cell.remove();
 *       showMessage('Door unlocked!');
 *     }
 *   }
 * }
 * ```
 */
export type Template<T extends string = string> = Partial<
	Omit<CellState<T>, 'position' | 'symbol' | 'isOnScreen'>
>

/**
 * Game state configuration parameters
 * @template T - String literal type for cell template keys
 */
export type GameStateParams<T extends string> = {
	/** Player configuration */
	player: PlayerParams
	/** Cell templates that define game entities */
	templates: Templates<T>
	/** String representation of the game map */
	map: string
	/** Optional visual filter settings */
	filter?: FilterParams
}

export type CellState<T extends string> = {
	symbol: T
	/** Visual representation - color index, character, or pixel art string */
	sprite: Tile | null
	/** Sound effect to play on interaction */
	sound: UnTuplify<PlaySoundArgs> | null
	/** Text displayed when player interacts with this cell */
	dialog: string | null
	/** Whether this cell blocks movement */
	solid: boolean
	/** Whether this cell's sprite is rendered */
	visible: boolean
	isOnScreen: boolean
	/** Whether this cell renders in front of the player */
	foreground: boolean
	/** Game ending condition - true ends game, string/array shows ending message */
	end: boolean | string | string[] | null
	position: [number, number]
	/** Called when player tries to move into this cell's position */
	onCollide?: (target: CellFacade<T>) => any
	/** Called when player moves into this cell's position */
	onEnter?: (target: CellFacade<T>) => any
	/** Called when player leaves this cell's position */
	onLeave?: (target: CellFacade<T>) => any
	/** Called when this cell becomes visible on screen */
	onScreenEnter?: (target: CellFacade<T>) => any
	/** Called when this cell goes off screen */
	onScreenLeave?: (target: CellFacade<T>) => any
	/** Called at the end of each game turn */
	onTurn?: (target: CellFacade<T>) => any
}
