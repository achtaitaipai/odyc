import { createGame } from '../../../dist/index'

const state = {}

export const init = () => {
	const game = createGame({
		templates: { '.': {} },
	})

	game.addToCell(0, 0, '.')
	return { game, state }
}
