const state = {}

export const init = (createGame) => {
	const game = createGame({
		templates: {
			// wall
			w: {
				sprite: 3,
				solid: true,
			},
			// road
			r: {
				sprite: 4,
				solid: false,
			},
		},
		map: `
    .w.
    ...
    .r.
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
