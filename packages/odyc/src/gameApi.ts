import { clearPreviousGame, setClearGame } from './clearGame.js'
import { Dialog } from './dialog.js'
import type { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { MessageBox } from './messageBox.js'
import { Prompt } from './prompt.js'
import { Renderer } from './renderer.js'
import { SoundPlayer } from './sound.js'
import { GameApi } from './types.js'

export const initGameApi = <T extends string>(
	gameState: GameState<T>,
	dialog: Dialog,
	prompt: Prompt,
	soundPlayer: SoundPlayer,
	ender: Ender,
	messageBox: MessageBox,
	renderer: Renderer,
) => {
	const gameApi: GameApi<T> = {
		// deprecated methods
		getCell: (x, y) => gameState.cells.getCellAt(x, y),
		addToCell: (x, y, symbol) => gameState.cells.setCellAt(x, y, symbol),
		setCell: (x, y, params) => gameState.cells.updateCellAt(x, y, params),
		clearCell: (x, y) => gameState.cells.getCellAt(x, y).remove(),
		getAll: (symbol) => gameState.cells.getCells({ symbol }),
		setAll: (symbol, params) => gameState.cells.updateCells({ symbol }, params),

		player: gameState.player.facade,
		getCellAt: (x, y) => gameState.cells.getCellAt(x, y),
		setCellAt: (x, y, symbol) => gameState.cells.setCellAt(x, y, symbol),
		updateCellAt: (x, y, params) => gameState.cells.updateCellAt(x, y, params),
		clearCellAt: (x, y) => gameState.cells.getCellAt(x, y).remove(),
		getCells: (query) => gameState.cells.getCells(query),
		setCells: (query, symbol) => gameState.cells.setCells(query, symbol),
		updateCells: (query, params) => gameState.cells.updateCells(query, params),
		clearCells: (query) => gameState.cells.clearCells(query),
		sendMessageToCells: (query, message) =>
			gameState.cells.sendMessageToCells(query, message),
		openDialog: (text) => dialog.open(text),
		prompt: (...options) => prompt.open(...options),
		openMenu: (options) => prompt.openMenu(options),
		openMessage: (...args) => messageBox.open(args),
		playSound: (...args) => soundPlayer.play(...args),
		end: (...messages) => ender.play(...messages),
		loadMap: (map, playerPosition) => {
			if (playerPosition) gameState.player.position = [...playerPosition]
			gameState.gameMap.map = map
			gameState.player.saveCurrentState()
		},
		updateFilter: (uniforms) => {
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
		clear: (color) => {
			clearPreviousGame(color)
		},
	}
	setClearGame(renderer, dialog, messageBox, prompt, gameApi)
	return gameApi
}
