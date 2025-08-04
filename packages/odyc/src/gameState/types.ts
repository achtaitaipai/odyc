import { FilterParams } from '../shaders/filterSettings.js'
import { PlaySoundArgs } from '../sound.js'
import { Position, Tile, UnTuplify } from '../types.js'
import { CellFacade } from './cellFacade.js'
import { PlayerParams } from './player.js'

export type Templates<T extends string = string> = {
	[K in T]: ((position: Position) => Template<K>) | Template<K>
}

export type Template<T extends string = string> = Partial<
	Omit<CellState<T>, 'id' | 'position' | 'symbol' | 'isOnScreen'>
>

export type GameStateParams<T extends string = string> = {
	player: PlayerParams
	templates: Templates<T>
	map: string
	filter?: FilterParams
}

// Params of a Cell
export type CellState<T extends string> = {
	/** Unique identifier for this cell instance */
	id: string
	/** The symbol/type of this cell from the template system */
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
	/** Whether this cell's sprite is rendered */
	isOnScreen: boolean
	/** Whether this cell renders in front of the player */
	foreground: boolean
	/** Game ending condition - true ends game, string/array shows ending message */
	end: boolean | string | string[] | null
	/** Cell position */
	position: [number, number]
	/** Called when player tries to move into this cell's position */
	onCollide?: (target: CellFacade<T>) => any
	/** Called after player collides with this cell */
	onCollideStart?: (target: CellFacade<T>) => any
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
	/** Called when a message is sent to this cell via sendMessageToCells */
	onMessage?: (target: CellFacade<T>, message?: any) => any
}

/**
 * Parameters for updating cell properties.
 * Excludes immutable fields (symbol, position) and event handlers to prevent accidental overwrites.
 */
export type CellParams = Partial<
	Omit<
		CellState<string>,
		| 'id'
		| 'symbol'
		| 'position'
		| 'onCollide'
		| 'onCollideStart'
		| 'onEnter'
		| 'onLeave'
		| 'onScreenEnter'
		| 'onScreenLeave'
		| 'onTurn'
		| 'onMessage'
	>
>

/**
 * Query parameters for filtering cells.
 * Supports all updateable properties plus coordinate-based and symbol-based filtering.
 *
 * @template T - String literal type for cell symbols
 */
export type CellQuery<T extends string> = Partial<
	CellParams & {
		x?: number
		y?: number
		symbol?: T | T[]
	}
>
