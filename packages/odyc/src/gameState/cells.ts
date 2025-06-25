import { Camera } from '../camera'
import { vec2 } from '../helpers'
import { createGridFromString, createObservable, Observable } from '../lib'
import { Unwrap } from '../types'
import { CellFacade } from './cellFacade'
import { GameMap } from './gameMap'
import { CellState, Template, Templates } from './types'

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

	getAll(symbol: T) {
		return this.#values
			.filter((el) => el.symbol === symbol)
			.map((el) => new CellFacade(el.position, this))
	}

	setAll(symbol: T, params: Unwrap<Partial<Omit<CellState<T>, 'symbol'>>>) {
		for (let index = 0; index < this.#values.length; index++) {
			const cell = this.#values[index]
			if (cell?.symbol !== symbol) continue
			const newValue = Object.assign({}, cell, params)
			this.#values[index] = newValue
		}
		this.#observable.notify()
	}

	setCell(
		x: number,
		y: number,
		params: Unwrap<Partial<Omit<CellState<T>, 'symbol'>>>,
	) {
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

	addToCell(x: number, y: number, symbol: T) {
		const template = this.#getTemplateParams(this.#templates, symbol)
		if (!template) return
		this.#values = [
			...this.#values.filter((el) => !vec2([x, y]).equals(el.position)),
			this.#createCellFromTemplate(x, y, symbol, template),
		]

		this.#observable.notify()
	}

	getCell(x: number, y: number) {
		return new CellFacade([x, y], this)
	}

	clearCell(x: number, y: number) {
		this.#values = this.#values.filter(
			(el) => !vec2(el.position).equals([x, y]),
		)
		this.#observable.notify()
	}

	getEvent(
		x: number,
		y: number,
		eventKey:
			| 'onCollide'
			| 'onEnter'
			| 'onLeave'
			| 'onScreenLeave'
			| 'onScreenEnter'
			| 'onTurn',
	) {
		const event = this.#values.find(
			(el) => el.position[0] === x && el.position[1] === y,
		)?.[eventKey]
		if (event) return () => event(this.getCell(x, y))
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
				const template = this.#getTemplateParams(templates, cellSymbol)
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
			onEnter: template.onEnter,
			onLeave: template.onLeave,
			onScreenEnter: template.onScreenEnter,
			onScreenLeave: template.onScreenLeave,
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
