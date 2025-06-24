const state = {}

import { createGame } from 'odyc'

export const init = () => {
	const game = createGame({
		templates: {
			'.': { sprite: 5, visible: false },
		},
		map: '.',
		player: {
			sprite: ``,
		},
	})

	return { game, state }
}
