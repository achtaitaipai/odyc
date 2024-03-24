import { ActorState, TemplateEventsListeners } from '../types.js'
import { PlayerParams, createPlayer } from './player.js'

export type Templates = Record<string | number | symbol, Template>

export type Template = Partial<ActorState & TemplateEventsListeners>

export type Player = ReturnType<typeof createPlayer>

export type GameStateParams<T extends Templates> = {
	player: PlayerParams
	templates: T
	map: string
}
