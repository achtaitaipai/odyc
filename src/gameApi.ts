import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { MessageBox } from './messageBox.js'
import { PlaySoundArgs, SoundPlayer } from './sound.js'
import { Position } from './types.js'
export const initGameApi = <T extends string>(
	gameState: GameState<T>,
	dialog: Dialog,
	soundPlayer: SoundPlayer,
	ender: Ender,
	messageBox: MessageBox,
) => {
	const gameApi = {
		player: gameState.player.playerProxy,
		getCell: gameState.actors.getCell,
		addToCell: gameState.actors.addToCell,
		setCell: gameState.actors.setCell,
		getAll: gameState.actors.getAll,
		setAll: gameState.actors.setAll,
		openDialog: (text: string) => dialog.open(text),
		openMessage: (...args: string[]) => messageBox.open(args),
		playSound: (...args: PlaySoundArgs) => soundPlayer.play(...args),
		end: (message?: string) => ender.play(message),
		loadMap: (map: string, playerPosition?: Position) => {
			if (playerPosition)
				gameState.player.playerProxy.position = [...playerPosition]
			gameState.mapStore.store.set(map)
			gameState.player.saveCurrentState()
		},
		get width() {
			return gameState.mapStore.getDimensions()[0]
		},
		get height() {
			return gameState.mapStore.getDimensions()[1]
		},
	}
	return gameApi
}
