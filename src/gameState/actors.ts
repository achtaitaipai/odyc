import { compareVectors, createGridFromString } from '../lib/index.js'
import { createStore } from '../lib/store.js'
import {
	ActorState,
	TemplateEventsListeners as TemplatesEventsListeners,
	Position,
	Unwrap,
} from '../types.js'
import { createActorProxy } from './actorProxy.js'
import { MapStore } from './map.js'
import { GameStateParams, Template, Templates } from './types.js'

export const createActorsStore = <T extends Templates>(
	params: Omit<GameStateParams<T>, 'player'>,
	mapStore: MapStore,
) => {
	const templates = params.templates
	const eventsListeners = new Map<
		string | number | symbol,
		TemplatesEventsListeners
	>()
	for (const key in templates) {
		const template = templates[key]
		if (!template) continue
		eventsListeners.set(key, {
			onCollide: template.onCollide,
			onEnter: template.onEnter,
			onLeave: template.onLeave,
		})
	}

	let actorsValues: ActorState[] = []
	const store = createStore(actorsValues)
	store.subscribe((value) => {
		actorsValues = value
	})
	mapStore.store.subscribe((map) => {
		store.set(createActors(createGridFromString(map), templates))
	})
	const setAll = (
		symbol: keyof T,
		params: Unwrap<Partial<Omit<ActorState, 'symbol'>>>,
	) => {
		store.update((actors) => {
			for (let index = 0; index < actors.length; index++) {
				const actor = actors[index]
				if (actor?.symbol !== symbol) continue
				const newValue = Object.assign({}, actor, params)
				actors[index] = newValue
			}
			return actors
		})
	}
	const removeAll = (symbol: keyof T) => {
		store.update((actors) => actors.filter((el) => el.symbol !== symbol))
	}
	const setCell = (
		x: number,
		y: number,
		params: Unwrap<Partial<Omit<ActorState, 'symbol'>>>,
	) => {
		store.update((currentActors) => {
			for (let index = 0; index < currentActors.length; index++) {
				const actor = currentActors[index]
				if (
					!actor ||
					!actor.position ||
					!compareVectors(actor.position, [x, y])
				)
					continue
				const newValue = Object.assign({}, actor, params)
				currentActors[index] = newValue
			}
			return currentActors
		})
	}
	const addToCell = (x: number, y: number, symbol: keyof T) => {
		const template = templates[symbol]
		if (template)
			store.update((actors) => {
				return [
					...actors.filter((el) => !compareVectors([x, y], el.position)),
					createActorFromTemplate(x, y, symbol, template),
				]
			})
	}
	const getCell = (...position: Position) => createActorProxy(position, store)

	const reset = () =>
		store.set(
			createActors(createGridFromString(mapStore.store.get()), templates),
		)
	return {
		getCell,
		setCell,
		setAll,
		removeAll,
		addToCell,
		reset,
		_store: store,
		_eventsListeners: eventsListeners,
	}
}

const createActors = (mapGrid: string[], templates: Templates) => {
	const actors: ActorState[] = []
	for (let y = 0; y < mapGrid.length; y++) {
		const row = mapGrid[y]
		if (!row) continue
		for (let x = 0; x < row.length; x++) {
			const actorSymbol = row[x]
			if (!actorSymbol) continue
			const template = templates[actorSymbol]
			if (!template) continue
			actors.push(createActorFromTemplate(x, y, actorSymbol, template))
		}
	}
	return actors
}

export const createActorFromTemplate = <T extends Templates>(
	x: number,
	y: number,
	symbol: keyof T,
	template: Template,
): ActorState => {
	return {
		symbol: symbol,
		sprite: template.sprite ?? null,
		position: [x, y],
		dialog: template.dialog ?? null,
		end: template.end ?? null,
		sound: template.sound ?? null,
		solid: template.solid !== false,
		visible: template.visible !== false,
	}
}
