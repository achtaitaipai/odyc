const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 2,
		screenHeight: 2,
	})

	return { game, state }
}
