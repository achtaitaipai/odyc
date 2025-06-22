const state = {}

import { createGame } from '../../../dist/index'
import { DIALOG_SPEED_SLOW } from '../../../src/consts'

export const init = () => {
	const game = createGame({
		map: ``,
		background: 'black',
		dialogInternvalMs: 2000,
		player: {
			sprite: ``,
			onInput: () => {
				game.openDialog('Hi')
			},
		},
	})

	return { game, state }
}
