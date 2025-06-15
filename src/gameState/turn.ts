export class Turn {
	#value = 0
	constructor() {}

	next() {
		this.#value++
	}
	get value() {
		return this.#value
	}
	reset() {
		this.#value = 0
	}
}
