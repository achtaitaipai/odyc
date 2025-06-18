const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 7,
		screenHeight: 7,
	})

	return { game, state }
}
