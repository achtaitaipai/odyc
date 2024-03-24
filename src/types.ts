import { Dialog } from './dialog.js'
import { SoundPlayer } from './soundPlayer.js'
import { MessageBox } from './messageBox.js'
import { ActorProxy } from './gameState/actorProxy.js'

export type Tile = string | number

export type Position = [number, number]

export type Sound = string

export type TemplateEventsListeners = {
	onCollide?: (e: GameEvent) => any
	onEnter?: (e: GameEvent) => any
	onLeave?: (e: GameEvent) => any
}

export type GameEvent = ActorProxy

export type ActorState = {
	symbol: string | number | symbol
	sprite: Tile | null
	sound: string | null
	dialog: string | null
	solid: boolean
	visible: boolean
	end: string | null
	position: [number, number]
}

export type Unwrap<T> = {
	[K in keyof T]: T[K]
} & {}
