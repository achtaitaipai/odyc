import { Dialog } from './dialog.js'
import { GameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { SoundPlayer } from './soundPlayer.js'
import type { Ender } from './ender.js'
export const initGameApi = <T extends Templates>(
	gameState: GameState<T>,
	dialog: Dialog,
	soundPlayer: SoundPlayer,
	ender: Ender,
) => {
	const gameApi = {
		player: gameState.player.playerProxy,
		getCell: gameState.actors.getCell,
		addToCell: gameState.actors.addToCell,
		setCell: gameState.actors.setCell,
		setAll: gameState.actors.setAll,
		removeAll: gameState.actors.removeAll,
		getCollisionCount: gameState.counts.getCollision,
		getEnterCount: gameState.counts.getEnter,
		getLeaveCount: gameState.counts.getLeave,
		openDialog: (text: string) => dialog.open(text),
		playSound: (sound: string) => soundPlayer.play(sound),
		end: (message: string) => ender.play(message),
		reset: () => {
			gameState.player.reset()
			gameState.actors.reset()
			gameState.counts._reset()
		},
	}
	return gameApi
}
