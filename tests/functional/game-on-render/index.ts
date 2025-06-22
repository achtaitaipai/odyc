import { createGame } from '../../../dist/index'

const state = {}

export const init = () => {
	const game = createGame({
		map: ``,
		screenWidth: 3,
		screenHeight: 3,
		cellWidth: 1,
		cellHeight: 1,
		player: {
			sprite: 0,
			position: [1, 1],
		},
	})

	return { game, state }
}
