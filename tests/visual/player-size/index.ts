const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 4,
		screenHeight: 4,
	})

	return { game, state }
}
