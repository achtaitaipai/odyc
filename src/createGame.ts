import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initEnder } from './ender.js'
import { initGameApi } from './gameApi.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { initInputsHandler } from './inputs.js'
import { initMessageBox } from './messageBox.js'
import { initRenderer } from './renderer.js'
import { initSoundPlayer } from './soundPlayer.js'

export const createGame = <T extends Templates>(
	userConfig: Partial<Config<T>>,
) => {
	const config: Config<T> & typeof defaultConfig = Object.assign(
		{},
		defaultConfig,
		userConfig,
	)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const camera = initCamera(config)
	const renderer = initRenderer(config)
	const dialog = initDialog(config)
	const messageBox = initMessageBox(config)
	const ender = initEnder({ gameState, messageBox, camera })

	const gameLoop = initGameLoop({
		gameState: gameState,
		soundPlayer: soundPlayer,
		dialog,
		ender: ender,
	})

	initInputsHandler(config, (input) => {
		if (messageBox.isOpen) {
			if (input === 'ACTION') messageBox.next()
		} else if (dialog.isOpen) {
			if (input === 'ACTION') dialog.next()
		} else if (input !== 'ACTION') gameLoop.update(input)
	})

	gameState.actors._store.subscribe((actors) => {
		camera.update(
			gameState.player.playerProxy.position,
			gameState.mapStore.getDimensions(),
		)
		renderer.render([...actors, gameState.player.playerProxy], camera.position)
	})

	gameState.player.playerStore.subscribe((player) => {
		camera.update(
			gameState.player.playerProxy.position,
			gameState.mapStore.getDimensions(),
		)
		renderer.render([...gameState.actors._store.get(), player], camera.position)
	})

	if (config.title) messageBox.open(config.title)
	return initGameApi(gameState, dialog, soundPlayer, ender, messageBox)
}
