import {
	createGridFromString,
	createObservable,
	getGridSize,
	Observable,
} from '../lib'

export class GameMap {
	#map: string
	#observable: Observable<string>

	constructor(map: string) {
		this.#map = map
		this.#observable = createObservable()
	}

	subscribe(callback: (map: string) => void) {
		return this.#observable.subscribe(callback)
	}

	get map() {
		return this.#map
	}

	set map(value: string) {
		this.#map = value
		this.#observable.notify(this.#map)
	}

	get dimensions() {
		return getGridSize(createGridFromString(this.#map))
	}
}
