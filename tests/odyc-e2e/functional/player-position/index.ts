import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({})
	game.player.position = [7, 7]
	return { game, state }
}
