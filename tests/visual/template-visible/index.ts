const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const game = createGame({
		templates: {
			's': { sprite: 5, visible: false },
		},
		map: 's',
	})

	return { game, state }
}
