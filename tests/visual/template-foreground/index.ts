const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		templates: {
			'.': { sprite: '0.', foreground: true },
		},
		map: '.',
		player: {
			sprite: '3',
		},
		screenWidth: 1,
		screenHeight: 1,
	})

	return { game, state }
}
