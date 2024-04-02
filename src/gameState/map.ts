import { createGridFromString, getGridSize } from '../lib/index.js'
import { createStore } from '../lib/store.js'
import { Position } from '../types.js'

export const createMapStore = (map: string) => {
	const store = createStore(map)
	let dimensions: Position = [0, 0]

	store.subscribe((currentMap) => {
		dimensions = getGridSize(createGridFromString(currentMap))
	})

	return {
		store,
		getDimensions() {
			return dimensions
		},
	}
}

export type MapStore = ReturnType<typeof createMapStore>
