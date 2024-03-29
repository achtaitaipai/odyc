import { Dialog } from './dialog.js'
import { GameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { SoundPlayer } from './soundPlayer.js'
import type { Ender } from './ender.js'
import { createSound } from './index.js'
import { FxKey } from './lib/jfxr.js'
import { Position } from './types.js'
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
		openDialog: (text: string) => dialog.open(text),
		playSound: (template: FxKey, seed?: number) =>
			soundPlayer.play(createSound(template, seed)),
		end: (message?: string) => ender.play(message),
		loadMap: (map: string, playerPosition?: Position) => {
			if (playerPosition) gameState.player.playerProxy.position = playerPosition
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
