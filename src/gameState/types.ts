import { ActorState, TemplateEventsListeners } from '../types.js'
import { PlayerParams, createPlayer } from './player.js'

export type Templates = { [key: string]: Template }

export type Template = Partial<
	Omit<ActorState, 'position' | 'symbol'> & TemplateEventsListeners
>

export type Player = ReturnType<typeof createPlayer>

export type GameStateParams<T extends Templates> = {
	player: PlayerParams
	templates: T
	map: string
}
