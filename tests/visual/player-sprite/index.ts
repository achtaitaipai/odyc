const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		map: `
    .
    `,
		screenWidth: 1,
		screenHeight: 1,
		cellWidth: 4,
		cellHeight: 4,
		player: {
			sprite: `
      012
      345
      678
      `,
			position: [0, 0],
		},
	})

	return { game, state }
}
