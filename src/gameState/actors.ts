import {
	compareVectors,
	createGridFromString,
	createObservable,
	Observable,
} from '../lib'
import { PlaySoundArgs } from '../sound'
import { Unwrap } from '../types'
import { ActorFacade } from './actorFacade'
import { GameMap } from './gameMap'
import { ActorState, Template, Templates } from './types'

type ActorsParams<T extends string> = {
	templates: Templates<T>
}
export class Actors<T extends string> {
	#values: ActorState<T>[] = []
	#gameMap: GameMap
	#templates: Templates<T>
	#observable: Observable

	constructor(params: ActorsParams<T>, gameMap: GameMap) {
		this.#gameMap = gameMap
		this.#templates = params.templates
		this.#observable = createObservable()
		this.initActors()
		gameMap.subscribe(() => this.initActors())
	}

	subscribe(callback: () => void) {
		this.#observable.subscribe(callback)
	}

	getAll(symbol: T) {
		console.log(symbol, this.#values)
		return this.#values
			.filter((el) => el.symbol === symbol)
			.map((el) => new ActorFacade(el.position, this))
	}

	setAll(symbol: T, params: Unwrap<Partial<Omit<ActorState<T>, 'symbol'>>>) {
		for (let index = 0; index < this.#values.length; index++) {
			const actor = this.#values[index]
			if (actor?.symbol !== symbol) continue
			const newValue = Object.assign({}, actor, params)
			this.#values[index] = newValue
		}
		this.#observable.notify()
	}

	setCell(
		x: number,
		y: number,
		params: Unwrap<Partial<Omit<ActorState<T>, 'symbol'>>>,
	) {
		for (let index = 0; index < this.#values.length; index++) {
			const actor = this.#values[index]
			if (actor && actor.position && compareVectors(actor.position, [x, y])) {
				const newValue = Object.assign({}, actor, params)
				this.#values[index] = newValue
				break
			}
		}
		this.#observable.notify()
	}

	addToCell(x: number, y: number, symbol: T) {
		const template = this.#getTemplateParams(this.#templates, symbol)
		if (!template) return
		this.#values = [
			...this.#values.filter((el) => !compareVectors([x, y], el.position)),
			this.#createActorFromTemplate(x, y, symbol, template),
		]

		this.#observable.notify()
	}

	getCell(x: number, y: number) {
		return new ActorFacade([x, y], this)
	}

	clearCell(x: number, y: number) {
		this.#values = this.#values.filter(
			(el) => !compareVectors(el.position, [x, y]),
		)
		this.#observable.notify()
	}

	getEvent(
		x: number,
		y: number,
		eventKey: 'onCollide' | 'onEnter' | 'onLeave' | 'onTurn',
	) {
		const event = this.#values.find(
			(el) => el.position[0] === x && el.position[1] === y,
		)?.[eventKey]
		if (event) return () => event(this.getCell(x, y))
	}

	get() {
		return this.#values
	}

	}

	initActors() {
		this.#values = this.#createActors(
			createGridFromString(this.#gameMap.map),
			this.#templates,
		)
	}

	#createActors(mapGrid: string[], templates: Templates<T>) {
		const actors: ActorState<T>[] = []
		for (let y = 0; y < mapGrid.length; y++) {
			const row = mapGrid[y]
			if (!row) continue
			for (let x = 0; x < row.length; x++) {
				const actorSymbol = row[x] as T | undefined
				if (!actorSymbol) continue
				const template = this.#getTemplateParams(templates, actorSymbol)
				if (!template) continue
				actors.push(this.#createActorFromTemplate(x, y, actorSymbol, template))
			}
		}
		return actors
	}

	#createActorFromTemplate<T extends string>(
		x: number,
		y: number,
		symbol: T,
		template: Template<T>,
	): ActorState<T> {
		return {
			symbol: symbol,
			sprite: template.sprite ?? null,
			position: [x, y],
			dialog: template.dialog ?? null,
			end: template.end ?? null,
			sound: template.sound ?? null,
			solid: template.solid !== false,
			visible: template.visible !== false,
			onCollide: template.onCollide,
			onEnter: template.onEnter,
			onLeave: template.onLeave,
			onTurn: template.onTurn,
		}
	}

	#getTemplateParams<T extends string>(
		templates: Templates<T>,
		symbol: T,
	): Template<T> | undefined {
		const templateSrc = templates[symbol]
		if (!templateSrc) return
		return typeof templateSrc === 'function' ? templateSrc() : templateSrc
	}
}
