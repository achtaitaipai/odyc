import { ActorProxy } from './gameState/actorProxy.js'

export type Tile = string | number

export type Position = [number, number]

export type Sound = string

export type TemplateEventsListeners = {
	onCollide?: (target: ActorProxy) => any
	onEnter?: (target: ActorProxy) => any
	onLeave?: (target: ActorProxy) => any
}

export type ActorState = {
	symbol: string
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
