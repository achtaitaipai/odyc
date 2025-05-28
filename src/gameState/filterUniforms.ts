import { createStore } from '../lib'
import { Uniforms } from '../shaders/filterSettings'

export const createUniformsStore = (uniforms: Uniforms) => {
	const copy: Uniforms = {}
	for (const key in uniforms) {
		const value = uniforms[key]
		if (value !== undefined)
			copy[key] = Array.isArray(value) ? [...value] : value
	}
	const store = createStore(copy)
	return store
}
