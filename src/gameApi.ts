import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { Filter } from './filter.js'
import { GameState } from './gameState/index.js'
import { MessageBox } from './messageBox.js'
import { MenuOption, Prompt } from './prompt.js'
import { Uniforms } from './shaders/filterSettings.js'
import { PlaySoundArgs, SoundPlayer } from './sound.js'
import { Position } from './types.js'
export const initGameApi = <T extends string>(
	gameState: GameState<T>,
	dialog: Dialog,
	prompt: Prompt,
	soundPlayer: SoundPlayer,
	ender: Ender,
	messageBox: MessageBox,
) => {
	const gameApi = {
		player: gameState.player.facade,
		getCell: gameState.actors.getCell,
		addToCell: gameState.actors.addToCell,
		setCell: gameState.actors.setCell,
		getAll: gameState.actors.getAll,
		setAll: gameState.actors.setAll,
		openDialog: (text: string) => dialog.open(text),
		prompt: (...options: string[]) => prompt.open(...options),
		openMenu: (options: MenuOption) => prompt.openMenu(options),
		openMessage: (...args: string[]) => messageBox.open(args),
		playSound: (...args: PlaySoundArgs) => soundPlayer.play(...args),
		end: (...messages: string[]) => ender.play(...messages),
		loadMap: (map: string, playerPosition?: Position) => {
			if (playerPosition) gameState.player.position = [...playerPosition]
			gameState.gameMap.map = map
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
			return gameState.gameMap.dimensions[0]
		},
		get height() {
			return gameState.gameMap.dimensions[1]
		},
	}
	return gameApi
}
