const state = {}

import { createGame } from 'odyc'

export const init = () => {
	const game = createGame({
		templates: {
			'.': { sprite: '0.', foreground: true },
		},
		colors: ['red', 'blue'],
		map: '.',
		player: {
			sprite: '1',
		},
		screenWidth: 1,
		screenHeight: 1,
	})

	return { game, state }
}
