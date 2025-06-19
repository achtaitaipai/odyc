import { createGame } from '../../../dist/index'

const state = {}

export const init = () => {
	createGame({ filter: { name: 'crt' } })
	createGame({ filter: { name: 'crt' } })
}
