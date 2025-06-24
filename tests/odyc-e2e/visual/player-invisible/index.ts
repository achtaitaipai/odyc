const state = {}

import { createGame } from 'odyc'

export const init = () => {
	const game = createGame({
		map: ``,
		background: 'black',
		screenWidth: 1,
		screenHeight: 1,
		cellWidth: 11,
		cellHeight: 11,
		colors: ['white'],
		player: {
			visible: false,
			sprite: `
		...........
		...........
		.0000.0000.
		..0000000..
		....000....
		.....0.....
		...........
		...........
		...........
		`,
		},
	})

	return { game, state }
}
