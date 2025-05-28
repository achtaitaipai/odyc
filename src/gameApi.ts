import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { Filter } from './filter.js'
import { GameState } from './gameState/index.js'
import { MessageBox } from './messageBox.js'
import { Uniforms } from './shaders/filterSettings.js'
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
		end: (...messages: string[]) => ender.play(...messages),
		loadMap: (map: string, playerPosition?: Position) => {
			if (playerPosition)
				gameState.player.playerProxy.position = [...playerPosition]
			gameState.mapStore.store.set(map)
			gameState.player.saveCurrentState()
		},
		updateFilter: (uniforms: Uniforms) => {
			gameState.uniformsStore.update((current) => {
				for (const [key, value] of Object.entries(uniforms)) {
					current[key] = Array.isArray(value) ? [...value] : value
				}
				return current
			})
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
