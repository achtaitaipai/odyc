const state = {}

import { createGame } from 'odyc'

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 8,
		screenHeight: 8,
	})

	return { game, state }
}
