import { Camera } from './camera.js'
import { GameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { MessageBox } from './messageBox.js'

type EnderParams = {
	gameState: GameState<Templates>
	messageBox: MessageBox
	camera: Camera
}

export type Ender = ReturnType<typeof initEnder>

export const initEnder = ({ gameState, messageBox, camera }: EnderParams) => {
	return {
		play: async (message?: string) => {
			if (message) {
				await messageBox.open(message)
			}
			camera.reset()
			gameState.counts._reset()
			gameState.player.reset()
			gameState.actors.reset()
		},
	}
}
