import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const el = document.getElementById('game-root')

	if (!el) {
		throw new Error('Game root HTML element missing')
	}

	const game = createGame({
		root: el,
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
