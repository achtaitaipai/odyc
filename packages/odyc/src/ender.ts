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
	let ending = false
	return {
		play: async (...messages: string[]) => {
			if (messages.length) {
				messageBox.open(messages)
			}
			ending = true
			camera.reset()
			gameState.turn.reset()
			gameState.player.restoreSavedState()
			gameState.cells.initCells()
		},
		get ending() {
			return ending
		},
		set ending(value: boolean) {
			ending = value
		},
	}
}
