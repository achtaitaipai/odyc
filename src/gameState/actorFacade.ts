import { vec2 } from '../helpers'
import { Position } from '../types'
import { Actors } from './actors'
import { ActorState } from './types'

export class ActorFacade<T extends string> {
	#position: Position
	#actors: Actors<T>

	constructor(position: Position, actors: Actors<T>) {
		this.#position = position
		this.#actors = actors
	}

	get sprite() {
		return this.#getActor()?.sprite ?? null
	}

	set sprite(value: ActorState<T>['sprite']) {
		this.#setActor('sprite', value)
	}

	get solid() {
		return this.#getActor()?.solid ?? false
	}

	set solid(value: ActorState<T>['solid']) {
		this.#setActor('solid', value)
	}

	get sound() {
		return this.#getActor()?.sound ?? null
	}

	set sound(value: ActorState<T>['sound']) {
		this.#setActor('sound', value)
	}

	get position() {
		return this.#getActor()?.position ?? [-1, -1]
	}

	get dialog() {
		return this.#getActor()?.dialog ?? null
	}

	set dialog(value: ActorState<T>['dialog']) {
		this.#setActor('dialog', value)
	}

	get visible() {
		return this.#getActor()?.visible ?? false
	}

	set visible(value: ActorState<T>['visible']) {
		this.#setActor('visible', value)
	}

	get foreground() {
		return this.#getActor()?.foreground ?? false
	}

	set foreground(value: ActorState<T>['foreground']) {
		this.#setActor('foreground', value)
	}

	get end() {
		return this.#getActor()?.end ?? null
	}

	set end(value: ActorState<T>['end']) {
		this.#setActor('end', value)
	}

	get symbol() {
		return (this.#getActor()?.symbol as T) ?? null
	}

	get isOnScreen() {
		return this.#getActor()?.isOnScreen ?? false
	}

	remove() {
		this.#actors.clearCell(...this.#position)
	}

	#getActor() {
		return this.#actors
			.get()
			.find((el) => vec2(el.position).equals(this.#position))
	}

	#setActor<U extends keyof ActorState<T>>(key: U, value: ActorState<T>[U]) {
		this.#actors.setCell(...this.#position, { [key]: value })
	}
}
