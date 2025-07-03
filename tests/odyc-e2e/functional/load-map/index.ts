import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({
		player: {
			sprite: 0,
			position: [1, 1],
		},
		templates: {
			'#': { solid: true, sprite: 1 },
			'.': { solid: false, sprite: 2 },
			x: { solid: false, sprite: 3 },
			o: { solid: false, sprite: 4 },
		},
		map: `
			###
			#.#
			###
		`,
	})
	return { game, state }
}
