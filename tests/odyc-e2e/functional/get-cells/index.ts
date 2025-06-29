import { createGame } from 'odyc'

const state = {}

export const init = () => {
	const game = createGame({
		templates: {
			'#': { solid: true, sprite: 1 },
			x: { solid: false, sprite: 2, dialog: 'Hello!' },
			e: { solid: false, sprite: 3, end: 'Game Over' },
			'*': { solid: false, sprite: 4, foreground: true },
			o: { solid: false, sprite: 5, visible: false },
			a: { solid: false, sprite: 6, end: ['win', 'victory'] },
			b: { solid: false, sprite: 7, end: ['lose'] },
		},
		map: `
			#x#
			e*o
			#ab
		`,
	})
	return { game, state }
}
