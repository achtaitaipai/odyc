import { createGame } from 'odyc'

const state = { call: 0 }

export const init = () => {
	createGame({
		player: {
			onInput() {
				state.call++
			},
		},
	})
	createGame({
		player: {
			onInput() {
				state.call++
			},
		},
	})

	return { state }
}
