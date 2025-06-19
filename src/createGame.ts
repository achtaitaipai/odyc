import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initEnder } from './ender.js'
import { initFilter } from './filter.js'
import { initGameApi } from './gameApi.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { initInputsHandler } from './inputs.js'
import { debounce } from './lib'
import { initMessageBox } from './messageBox.js'
import { initPrompt } from './prompt.js'
import { initRenderer } from './renderer.js'
import { initSoundPlayer } from './sound.js'

export const createGame = <T extends string>(
	userConfig?: Partial<Config<T>>,
) => {
	const config: Config<T> = Object.assign({}, defaultConfig, userConfig)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const camera = initCamera(config)
	const renderer = initRenderer(config)
	const dialog = initDialog({
		...config,
		soundPlayer,
	})
	const prompt = initPrompt(config)
	const messageBox = initMessageBox(config)
	const gameFilter = initFilter(renderer.canvas, config.filter)
	const ender = initEnder({ gameState, messageBox, camera })

	const renderGame = debounce(() => {
		gameFilter?.setUniforms(gameState.filterUniforms.get())
		camera.update(gameState.player.position, gameState.gameMap.dimensions)
		renderer.render(
			[...gameState.actors.get(), gameState.player.facade],
			camera,
		)
		gameState.actors.handleScreenEvents(camera)
		gameFilter?.render()
	}, 60)

	const gameLoop = initGameLoop({
		gameState,
		soundPlayer,
		dialog,
		ender,
	})

	initInputsHandler(config, (input) => {
		if (prompt.isOpen) {
			prompt.input(input)
		} else if (messageBox.isOpen) {
			if (input === 'ACTION') messageBox.next()
		} else if (dialog.isOpen) {
			if (input === 'ACTION') dialog.next()
		} else if (input !== 'ACTION') gameLoop.update(input)
	})

	gameState.subscribe(renderGame)

	if (config.title) messageBox.open(config.title)

	renderGame()

	return initGameApi<T>(
		gameState,
		dialog,
		prompt,
		soundPlayer,
		ender,
		messageBox,
	)
}
