const state = {}

import { createGame } from '../../../dist/index'

export const init = () => {
	const colors = []

	colors.push('red') // 0

	// 8 symbols, from 1 to 8
	for (let i = 0; i < 8; i++) {
		colors.push(`black`)
	}

	colors.push('green') // 9
	colors.push('blue') // a

	// 23 symbols, from b to y
	for (let i = 0; i < 24; i++) {
		colors.push(`black`)
	}

	colors.push('yellow') // z
	colors.push('pink') // A

	// 23 symbols, from B to Y
	for (let i = 0; i < 24; i++) {
		colors.push(`black`)
	}

	colors.push('purple') // Z

	const game = createGame({
		map: `
    .
    `,
		colors,
		screenWidth: 1,
		screenHeight: 1,
		cellWidth: 4,
		cellHeight: 2,
		player: {
			sprite: `
      09a
      zAZ
      `,
			position: [0, 0],
		},
	})

	return { game, state }
}
