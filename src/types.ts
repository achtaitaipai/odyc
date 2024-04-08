import { Actor } from './gameState/actorProxy.js'

export type Tile = string | number

export type Position = [number, number]

export type Sound = string

export type TemplateEventsListeners = {
	onCollide?: (target: Actor) => any
	onEnter?: (target: Actor) => any
	onLeave?: (target: Actor) => any
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
