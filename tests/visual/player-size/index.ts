const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 6,
		screenHeight: 6,
	})

	return { game, state }
}
