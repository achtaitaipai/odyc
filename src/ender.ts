import { Camera } from './camera.js'
import { GameState } from './gameState/index.js'
import { MessageBox } from './messageBox.js'

type EnderParams<T extends string> = {
	gameState: GameState<T>
	messageBox: MessageBox
	camera: Camera
}

export type Ender = ReturnType<typeof initEnder>

export const initEnder = <T extends string>({
	gameState,
	messageBox,
	camera,
}: EnderParams<T>) => {
	return {
		play: async (message?: string) => {
			if (message) {
				messageBox.open(message)
			}
			camera.reset()
			gameState.player.restoreSavedState()
			gameState.actors.reset()
		},
	}
}
