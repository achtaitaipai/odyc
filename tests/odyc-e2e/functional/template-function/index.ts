import { createGame } from 'odyc'

const receivedPositions: Array<[number, number]> = []

export const init = () => {
	receivedPositions.length = 0 // Clear array

	const game = createGame({
		templates: {
			'.': (position) => {
				receivedPositions.push([position[0], position[1]])
				return {}
			},
			'#': {},
		},
		map: `
			.#.
			#.#
			.#.
		`,
	})

	return { game, receivedPositions }
}
