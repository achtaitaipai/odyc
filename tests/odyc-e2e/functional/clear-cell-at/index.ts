import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({
		templates: { x: {} },
		map: `..x..`,
	})
	return { game, state }
}
