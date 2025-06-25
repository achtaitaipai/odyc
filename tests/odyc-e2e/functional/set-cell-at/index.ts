import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({
		templates: { '.': {} },
		map: '',
	})

	return { game, state }
}
