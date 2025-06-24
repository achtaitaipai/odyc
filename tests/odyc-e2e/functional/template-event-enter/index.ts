import { createGame } from 'odyc'

const state = {
	balance: 0, // coins collected
}

export const init = () => {
	const game = createGame({
		templates: {
			// coin
			c: {
				sprite: 5,
				solid: false,
				onEnter(target) {
					state.balance++
					target.remove()
				},
			},
		},
		map: `
    ccc
    ..c
    ..c
    `,
		screenWidth: 3,
		screenHeight: 3,
		player: {
			sprite: 0,
			position: [1, 1],
		},
	})

	return { game, state }
}
