import { FilterParams } from '../shaders/filterSettings.js'
import { PlaySoundArgs } from '../sound.js'
import { Tile, UnTuplify } from '../types.js'
import { PlayerParams, createPlayer } from './player.js'

export type Templates<T extends string = string> = {
	[K in T]: (() => Template<K>) | Template<K>
}

export type Template<T extends string = string> = Partial<
	Omit<ActorState<T>, 'position' | 'symbol' | 'onScreen'>
>

export type Player = ReturnType<typeof createPlayer>

export type GameStateParams<T extends string> = {
	player: PlayerParams
	templates: Templates<T>
	map: string
	filter?: FilterParams
}

export type ActorState<T extends string> = {
	symbol: T
	sprite: Tile | null
	sound: UnTuplify<PlaySoundArgs> | null
	dialog: string | null
	solid: boolean
	visible: boolean
	onScreen: boolean
	end: boolean | string | string[] | null
	position: [number, number]
	onCollide?: (target: ActorProxy<T>) => any
	onEnter?: (target: ActorProxy<T>) => any
	onLeave?: (target: ActorProxy<T>) => any
	onScreenEnter?: (target: ActorProxy<T>) => any
	onScreenLeave?: (target: ActorProxy<T>) => any
	onTurn?: (target: ActorProxy<T>) => any
}

export type ActorProxy<T extends string> = Omit<
	ActorState<T>,
	| 'onScreen'
	| 'onCollide'
	| 'onEnter'
	| 'onLeave'
	| 'onScreenEnter'
	| 'onScreenLeave'
	| 'onTurn'
> & {
	remove: () => void
}
