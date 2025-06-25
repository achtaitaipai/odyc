import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({
		root: document.getElementById('game-root'),
		map: `.`,
		screenWidth: 1,
		screenHeight: 1,
		player: {
			sprite: 3,
			position: [0, 0],
		},
	})

	return { game, state }
}
