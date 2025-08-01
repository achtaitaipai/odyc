import { Camera } from '../camera'
import { vec2 } from '../helpers'
import { createGridFromString, createObservable, Observable } from '../lib'
import { Position, Unwrap } from '../types'
import { CellFacade } from './cellFacade'
import { GameMap } from './gameMap'
import { CellParams, CellQuery, CellState, Template, Templates } from './types'

type CellsParams<T extends string> = {
	templates: Templates<T>
}
export class Cells<T extends string> {
	#values: CellState<T>[] = []
	#gameMap: GameMap
	#templates: Templates<T>
	#observable: Observable

	constructor(params: CellsParams<T>, gameMap: GameMap) {
		this.#gameMap = gameMap
		this.#templates = params.templates
		this.#observable = createObservable()
		this.initCells()
		gameMap.subscribe(() => this.initCells())
	}

	subscribe(callback: () => void) {
		this.#observable.subscribe(callback)
	}

	getCellAt(x: number, y: number) {
		return new CellFacade([x, y], this)
	}

	clearCellAt(x: number, y: number) {
		this.#values = this.#values.filter(
			(el) => !vec2(el.position).equals([x, y]),
		)
		this.#observable.notify()
	}

	updateCellAt(x: number, y: number, params: CellParams) {
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (cell && cell.position && vec2(cell.position).equals([x, y])) {
				const newValue = Object.assign({}, cell, params)
				this.#values[index] = newValue
				break
			}
		}
		this.#observable.notify()
	}

	setCellAt(x: number, y: number, symbol: T) {
		const template = this.#getTemplateParams(this.#templates, symbol, [x, y])
		if (!template) return
		this.#values = [
			...this.#values.filter((el) => !vec2([x, y]).equals(el.position)),
			this.#createCellFromTemplate(x, y, symbol, template),
		]

		this.#observable.notify()
	}

	getCells(query: CellQuery<T>) {
		return this.#queryCells(query).map(
			({ position }) => new CellFacade(position, this),
		)
	}

	updateCells(query: CellQuery<T>, params: CellParams) {
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (!cell || !this.#cellMatchesQuery(cell, query)) continue
			const newValue = Object.assign({}, cell, params)
			this.#values[index] = newValue
		}
		this.#observable.notify()
	}

	clearCells(query: CellQuery<T>) {
		this.#values = this.#values.filter(
			(cell) => !this.#cellMatchesQuery(cell, query),
		)
		this.#observable.notify()
	}

	setCells(query: CellQuery<T>, symbol: T) {
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (!cell || !this.#cellMatchesQuery(cell, query)) continue
			const template = this.#getTemplateParams(
				this.#templates,
				symbol,
				cell.position,
			)
			if (!template) continue
			this.#values[index] = this.#createCellFromTemplate(
				...cell.position,
				symbol,
				template,
			)
		}
		this.#observable.notify()
	}

	sendMessageToCells(query: CellQuery<T>, message?: any) {
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (!cell || !this.#cellMatchesQuery(cell, query) || !cell.onMessage)
				continue
			cell.onMessage(new CellFacade(cell.position, this), message)
		}
	}

	moveCell(from: Position, to: Position) {
		if (vec2(from).equals(to)) return
		this.#values = this.#values.filter(
			(cell) => !vec2(cell.position).equals(to),
		)
		this.#values = this.#values.map((cell) =>
			vec2(cell.position).equals(from) ? { ...cell, position: to } : cell,
		)
		this.#observable.notify()
	}

	#queryCells(query: CellQuery<T>) {
		return this.#values.filter((cell) => this.#cellMatchesQuery(cell, query))
	}

	#cellMatchesQuery(cell: CellState<T>, query: CellQuery<T>) {
		if ('x' in query && query.x !== cell.position[0]) return false
		if ('y' in query && query.y !== cell.position[1]) return false
		if ('sprite' in query && query.sprite !== cell.sprite) return false
		if ('solid' in query && query.solid !== cell.solid) return false
		if (
			'symbol' in query &&
			'symbol' !== undefined &&
			!(Array.isArray(query.symbol) ? query.symbol : [query.symbol]).includes(
				cell.symbol,
			)
		)
			return false
		if ('visible' in query && query.visible !== cell.visible) return false
		if ('foreground' in query && query.foreground !== cell.foreground)
			return false
		if ('dialog' in query && query.dialog !== cell.dialog) return false
		if ('end' in query) {
			if (typeof query.end !== typeof cell.end) return false
			if (typeof query.end === 'string' && cell.end !== query.end) return false
			if (typeof query.end === 'boolean' && cell.end !== query.end) return false
			if (Array.isArray(query.end)) {
				if (!Array.isArray(cell.end)) return false
				if (query.end.join('') !== cell.end.join('')) return false
			}
		}
		if ('isOnScreen' in query && query.isOnScreen !== cell.isOnScreen)
			return false
		return true
	}

	getEvent(
		x: number,
		y: number,
		eventKey:
			| 'onCollide'
			| 'beforeCollide'
			| 'onEnter'
			| 'onLeave'
			| 'onScreenLeave'
			| 'onScreenEnter'
			| 'onTurn',
	) {
		const event = this.#values.find(
			(el) => el.position[0] === x && el.position[1] === y,
		)?.[eventKey]
		if (event) return () => event(this.getCellAt(x, y))
	}

	get() {
		return this.#values
	}

	handleScreenEvents(camera: Camera) {
		const screenLeaveEventsQueue: ((() => void) | undefined)[] = []
		const screenEnterEventsQueue: ((() => void) | undefined)[] = []
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (!cell) continue
			const isOnScreen = camera.isOnScreen(cell.position)
			if (cell.isOnScreen === isOnScreen) continue
			this.#values[index]!.isOnScreen = isOnScreen
			if (!isOnScreen)
				screenLeaveEventsQueue.push(
					this.getEvent(...cell.position, 'onScreenLeave'),
				)
			else
				screenEnterEventsQueue.push(
					this.getEvent(...cell.position, 'onScreenEnter'),
				)
		}
		screenLeaveEventsQueue.forEach((el) => {
			if (el) el()
		})
		screenEnterEventsQueue.forEach((el) => {
			if (el) el()
		})
	}

	initCells() {
		this.#values = this.#createCells(
			createGridFromString(this.#gameMap.map),
			this.#templates,
		)
	}

	#createCells(mapGrid: string[], templates: Templates<T>) {
		const cells: CellState<T>[] = []
		for (let y = 0; y < mapGrid.length; y++) {
			const row = mapGrid[y]
			if (!row) continue
			for (let x = 0; x < row.length; x++) {
				const cellSymbol = row[x] as T | undefined
				if (!cellSymbol) continue
				const template = this.#getTemplateParams(templates, cellSymbol, [x, y])
				if (!template) continue
				cells.push(this.#createCellFromTemplate(x, y, cellSymbol, template))
			}
		}
		return cells
	}

	#createCellFromTemplate<T extends string>(
		x: number,
		y: number,
		symbol: T,
		template: Template<T>,
	): CellState<T> {
		return {
			id: crypto.randomUUID(),
			symbol: symbol,
			sprite: template.sprite ?? null,
			position: [x, y],
			dialog: template.dialog ?? null,
			isOnScreen: false,
			end: template.end ?? null,
			sound: template.sound ?? null,
			solid: template.solid !== false,
			visible: template.visible !== false,
			foreground: template.foreground === true,
			onCollide: template.onCollide,
			beforeCollide: template.beforeCollide,
			onEnter: template.onEnter,
			onLeave: template.onLeave,
			onScreenEnter: template.onScreenEnter,
			onScreenLeave: template.onScreenLeave,
			onTurn: template.onTurn,
			onMessage: template.onMessage,
		}
	}

	#getTemplateParams<T extends string>(
		templates: Templates<T>,
		symbol: T,
		position: Position,
	): Template<T> | undefined {
		const templateSrc = templates[symbol]
		if (!templateSrc) return
		return typeof templateSrc === 'function'
			? templateSrc(position)
			: templateSrc
	}
}
