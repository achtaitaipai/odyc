import { vec2 } from '../helpers'
import { Position } from '../types'
import { Cells } from './cells'
import { CellState } from './types'

export class CellFacade<T extends string = string> {
	#position: Position
	#cells: Cells<T>

	constructor(position: Position, cells: Cells<T>) {
		this.#position = position
		this.#cells = cells
	}

	get sprite() {
		return this.#getProperties()?.sprite ?? null
	}

	set sprite(value: CellState<T>['sprite']) {
		this.#setProperty('sprite', value)
	}

	get solid() {
		return this.#getProperties()?.solid ?? false
	}

	set solid(value: CellState<T>['solid']) {
		this.#setProperty('solid', value)
	}

	get sound() {
		return this.#getProperties()?.sound ?? null
	}

	set sound(value: CellState<T>['sound']) {
		this.#setProperty('sound', value)
	}

	get position() {
		return this.#getProperties()?.position ?? [-1, -1]
	}

	get dialog() {
		return this.#getProperties()?.dialog ?? null
	}

	set dialog(value: CellState<T>['dialog']) {
		this.#setProperty('dialog', value)
	}

	get visible() {
		return this.#getProperties()?.visible ?? false
	}

	set visible(value: CellState<T>['visible']) {
		this.#setProperty('visible', value)
	}

	get foreground() {
		return this.#getProperties()?.foreground ?? false
	}

	set foreground(value: CellState<T>['foreground']) {
		this.#setProperty('foreground', value)
	}

	get end() {
		return this.#getProperties()?.end ?? null
	}

	set end(value: CellState<T>['end']) {
		this.#setProperty('end', value)
	}

	get symbol() {
		return (this.#getProperties()?.symbol as T) ?? null
	}

	get isOnScreen() {
		return this.#getProperties()?.isOnScreen ?? false
	}

	remove() {
		this.#cells.clearCellAt(...this.#position)
	}

	#getProperties() {
		return this.#cells
			.get()
			.find((el) => vec2(el.position).equals(this.#position))
	}

	#setProperty<U extends keyof CellState<T>>(key: U, value: CellState<T>[U]) {
		this.#cells.updateCellAt(...this.#position, { [key]: value })
	}
}
