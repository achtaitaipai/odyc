import { createGame } from 'odyc'

const state = {}

export const init = () => {
	createGame({ filter: { name: 'crt' } })
	createGame({ filter: { name: 'crt' } })
}
