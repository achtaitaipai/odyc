import { PlaySoundArgs } from '../sound.js'
import { Tile, UnTuplify } from '../types.js'
import { PlayerParams, createPlayer } from './player.js'

export type Templates<T extends string> = { [K in T]: Template<K> }

export type Template<T extends string> = Partial<
	Omit<ActorState<T>, 'position' | 'symbol'> & ActorEvents<T>
>

export type Player = ReturnType<typeof createPlayer>

export type GameStateParams<T extends string> = {
	player: PlayerParams
	templates: Templates<T>
	map: string
}

export type ActorEvents<T extends string> = {
	onCollide?: (target: ActorProxy<T>) => any
	onEnter?: (target: ActorProxy<T>) => any
	onLeave?: (target: ActorProxy<T>) => any
}

export type ActorState<T extends string> = {
	symbol: T
	sprite: Tile | null
	sound: UnTuplify<PlaySoundArgs> | null
	dialog: string | null
	solid: boolean
	visible: boolean
	end: boolean | string | string[] | null
	position: [number, number]
}

export type ActorProxy<T extends string> = ActorState<T> & {
	remove: () => void
}
