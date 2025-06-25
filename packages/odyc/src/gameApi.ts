import { clearPreviousGame, setClearGame } from './clearGame.js'
import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { CellState } from './gameState/types.js'
import { MessageBox } from './messageBox.js'
import { MenuOption, Prompt } from './prompt.js'
import { Renderer } from './renderer.js'
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
	renderer: Renderer,
) => {
	const gameApi = {
		player: gameState.player.facade,
		getCell: (x: number, y: number) => gameState.cells.getCell(x, y),
		addToCell: (x: number, y: number, symbol: T) =>
			gameState.cells.addToCell(x, y, symbol),
		setCell: (
			x: number,
			y: number,
			params: Unwrap<Partial<Omit<CellState<T>, 'symbol'>>>,
		) => gameState.cells.setCell(x, y, params),
		getAll: (symbol: T) => gameState.cells.getAll(symbol),
		setAll: (
			symbol: T,
			params: Unwrap<Partial<Omit<CellState<T>, 'symbol'>>>,
		) => gameState.cells.setAll(symbol, params),
		clearCell: (x: number, y: number) => gameState.cells.getCell(x, y).remove(),
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
		clear: (color?: number | string) => {
			clearPreviousGame(color)
		},
	}
	setClearGame(renderer, dialog, messageBox, prompt, gameApi)
	return gameApi
}
