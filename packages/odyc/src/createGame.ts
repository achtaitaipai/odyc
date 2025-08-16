import { initCamera } from './camera.js'
import { clearPreviousGame } from './clearGame.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initEnder } from './ender.js'
import { initFilter } from './filter.js'
import { initGameApi } from './gameApi.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { getInputsHandler } from './inputs.js'
import { debounce } from './lib'
import { initMessageBox } from './messageBox.js'
import { initPrompt } from './prompt.js'
import { initRenderer } from './renderer.js'
import { initSoundPlayer } from './sound.js'
import { resolveTick } from './lib/index.js'

let clearPrevious: Function | null = () => {}

export const createGame = <T extends string>(
	userConfig?: Partial<Config<T>>,
) => {
	clearPrevious?.()
	const config: Config<T> = Object.assign({}, defaultConfig, userConfig)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const camera = initCamera(config)
	const renderer = initRenderer(config)
	const dialog = initDialog(config)
	const prompt = initPrompt(config)
	const messageBox = initMessageBox(config)
	const gameFilter = initFilter(renderer.canvas.element, {
		...config.filter,
		root: config.root,
	})
	const ender = initEnder({ gameState, messageBox, camera })

	const renderGame = debounce(() => {
		gameFilter?.setUniforms(gameState.filterUniforms.get())
		camera.update(gameState.player.position, gameState.gameMap.dimensions)

		renderer.render(gameState.player, gameState.cells.get(), camera)
		gameFilter?.render()

		gameState.cells.handleScreenEvents(camera)

		resolveTick()
	}, 60)

	const gameLoop = initGameLoop({
		gameState,
		soundPlayer,
		dialog,
		ender,
	})

	getInputsHandler(config, (input) => {
		if (prompt.isOpen) {
			prompt.input(input)
		} else if (messageBox.isOpen) {
			if (input === 'ACTION') messageBox.next()
		} else if (dialog.isOpen) {
			if (input === 'ACTION') dialog.next()
		} else {
			if (input !== 'ACTION') gameLoop.update(input)
			gameState.player.dispatchOnInput(input)
		}
	})

	gameState.subscribe(renderGame)

	clearPreviousGame()

	if (config.title) messageBox.open(config.title)

	renderGame()

	return initGameApi<T>(
		gameState,
		dialog,
		prompt,
		soundPlayer,
		ender,
		messageBox,
		renderer,
	)
}
