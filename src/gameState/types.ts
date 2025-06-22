import { FilterParams } from '../shaders/filterSettings.js'
import { PlaySoundArgs } from '../sound.js'
import { Tile, UnTuplify } from '../types.js'
import { ActorFacade } from './actorFacade.js'
import { PlayerParams } from './player.js'

/**
 * Actor templates that define behavior for game entities.
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
 * Template defining actor behavior and properties.
 * All properties are optional and define how actors behave in the game.
 * 
 * @template T - String literal type for template key
 * @example
 * ```typescript
 * const doorTemplate: Template<'d'> = {
 *   solid: true,
 *   sprite: 5,
 *   dialog: 'A locked door',
 *   onEnter: (actor) => {
 *     if (hasKey()) {
 *       actor.remove();
 *       showMessage('Door unlocked!');
 *     }
 *   }
 * }
 * ```
 */
export type Template<T extends string = string> = Partial<
	Omit<ActorState<T>, 'position' | 'symbol' | 'isOnScreen'>
>

/**
 * Game state configuration parameters
 * @template T - String literal type for actor template keys
 */
export type GameStateParams<T extends string> = {
	/** Player configuration */
	player: PlayerParams
	/** Actor templates that define game entities */
	templates: Templates<T>
	/** String representation of the game map */
	map: string
	/** Optional visual filter settings */
	filter?: FilterParams
}

export type ActorState<T extends string> = {
	symbol: T
	/** Visual representation - color index, character, or pixel art string */
	sprite: Tile | null
	/** Sound effect to play on interaction */
	sound: UnTuplify<PlaySoundArgs> | null
	/** Text displayed when player interacts with this actor */
	dialog: string | null
	/** Whether this actor blocks movement */
	solid: boolean
	/** Whether this actor's sprite is rendered */
	visible: boolean
	isOnScreen: boolean
	/** Whether this actor renders in front of the player */
	foreground: boolean
	/** Game ending condition - true ends game, string/array shows ending message */
	end: boolean | string | string[] | null
	position: [number, number]
	/** Called when player tries to move into this actor's position */
	onCollide?: (target: ActorFacade<T>) => any
	/** Called when player moves into this actor's position */
	onEnter?: (target: ActorFacade<T>) => any
	/** Called when player leaves this actor's position */
	onLeave?: (target: ActorFacade<T>) => any
	/** Called when this actor becomes visible on screen */
	onScreenEnter?: (target: ActorFacade<T>) => any
	/** Called when this actor goes off screen */
	onScreenLeave?: (target: ActorFacade<T>) => any
	/** Called at the end of each game turn */
	onTurn?: (target: ActorFacade<T>) => any
}
