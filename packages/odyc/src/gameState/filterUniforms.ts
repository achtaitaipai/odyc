import { createObservable, Observable } from '../lib'
import { Uniforms } from '../shaders/filterSettings'

export class FilterUniforms {
	#uniforms: Uniforms
	#observable: Observable

	constructor(uniforms: Uniforms) {
		this.#uniforms = this.#clone(uniforms)
		this.#observable = createObservable()
	}

	subscribe(callback: () => void) {
		this.#observable.subscribe(callback)
	}

	get() {
		return this.#clone(this.#uniforms)
	}

	set(values: Uniforms) {
		for (const [key, value] of Object.entries(values)) {
			this.#uniforms[key] = Array.isArray(value) ? [...value] : value
		}
		this.#observable.notify()
	}

	#clone(values: Uniforms) {
		const clone: Uniforms = {}
		for (const key in values) {
			const value = values[key]
			if (value !== undefined)
				clone[key] = Array.isArray(value) ? [...value] : value
		}
		return clone
	}
}
