import { FilterParams } from '../shaders/filterSettings.js'
import { PlaySoundArgs } from '../sound.js'
import { Tile, UnTuplify } from '../types.js'
import { ActorFacade } from './actorFacade.js'
import { PlayerParams } from './player.js'

export type Templates<T extends string = string> = {
	[K in T]: (() => Template<K>) | Template<K>
}

export type Template<T extends string = string> = Partial<
	Omit<ActorState<T>, 'position' | 'symbol' | 'isOnScreen'>
>

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
	voice: { template?: 'BLIP' | 'HIT' | 'PICKUP' | 'JUMP' | 'FALL' | 'POWERUP' | 'LASER' | 'BLIP_RANDOM', seed?: number | null } | null
	solid: boolean
	visible: boolean
	isOnScreen: boolean
	end: boolean | string | string[] | null
	position: [number, number]
	onCollide?: (target: ActorFacade<T>) => any
	onEnter?: (target: ActorFacade<T>) => any
	onLeave?: (target: ActorFacade<T>) => any
	onScreenEnter?: (target: ActorFacade<T>) => any
	onScreenLeave?: (target: ActorFacade<T>) => any
	onTurn?: (target: ActorFacade<T>) => any
}
