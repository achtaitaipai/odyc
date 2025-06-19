import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { ActorState, VoiceConfig } from './gameState/types.js'
import { MessageBox } from './messageBox.js'
import { MenuOption, Prompt } from './prompt.js'
import { Uniforms } from './shaders/filterSettings.js'
import { PlaySoundArgs, SoundPlayer } from './sound.js'
import { Position, Unwrap } from './types.js'
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
		getCell: (x: number, y: number) => gameState.actors.getCell(x, y),
		addToCell: (x: number, y: number, symbol: T) =>
			gameState.actors.addToCell(x, y, symbol),
		setCell: (
			x: number,
			y: number,
			params: Unwrap<Partial<Omit<ActorState<T>, 'symbol'>>>,
		) => gameState.actors.setCell(x, y, params),
		getAll: (symbol: T) => gameState.actors.getAll(symbol),
		setAll: (
			symbol: T,
			params: Unwrap<Partial<Omit<ActorState<T>, 'symbol'>>>,
		) => gameState.actors.setAll(symbol, params),
		openDialog: (text: string, voiceOverride?: VoiceConfig) =>
			dialog.open(text, undefined, voiceOverride),
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
			gameState.filterUniforms.set(uniforms)
		},
		get width() {
			return gameState.gameMap.dimensions[0]
		},
		get height() {
			return gameState.gameMap.dimensions[1]
		},
		get turn() {
			return gameState.turn.value
		},
	}
	return gameApi
}
