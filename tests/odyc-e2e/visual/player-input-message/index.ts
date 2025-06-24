const state = {}

import { createGame } from 'odyc'

export const init = () => {
	const game = createGame({
		messageBackground: 'black',
		messageColor: 'red',
		background: 'white',
		map: `
    c..c
    ....
    c..c
    .cc.
    `,
		templates: {
			c: {
				sprite: `0`,
			},
		},
		colors: ['gray'],
		screenWidth: 4,
		screenHeight: 4,
		cellWidth: 1,
		cellHeight: 1,
		player: {
			sprite: ``,
			onInput: (input) => {
				if (input === 'ACTION') {
					game.openMessage('Game over')
				}
			},
		},
	})

	return { game, state }
}
