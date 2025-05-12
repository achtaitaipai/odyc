import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initEnder } from './ender.js'
import { initGameApi } from './gameApi.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { ActorState, Player } from './gameState/types.js'
import { initInputsHandler } from './inputs.js'
import { debounce } from './lib'
import { initMessageBox } from './messageBox.js'
import { initRenderer } from './renderer.js'
import { initSoundPlayer } from './sound.js'

export const createGame = <T extends string>(
	userConfig: Partial<Config<T>>,
) => {
	const config: Config<T> = Object.assign({}, defaultConfig, userConfig)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const camera = initCamera(config)
	const renderer = initRenderer(config)
	const dialog = initDialog(config)
	const messageBox = initMessageBox(config)
	const ender = initEnder({ gameState, messageBox, camera })

	const gameLoop = initGameLoop({
		gameState,
		soundPlayer,
		dialog,
		ender,
	})

	initInputsHandler(config, (input) => {
		if (messageBox.isOpen) {
			if (input === 'ACTION') messageBox.next()
		} else if (dialog.isOpen) {
			if (input === 'ACTION') dialog.next()
		} else if (input !== 'ACTION') gameLoop.update(input)
	})

	const updateGame = debounce(
		(player: Player['playerProxy'], actors: ActorState<T>[]) => {
			camera.update(player.position, gameState.mapStore.getDimensions())
			renderer.render([...actors, player], camera.position)
		},
		60,
	)

	gameState.actors._store.subscribe((actors) => {
		updateGame(gameState.player.playerProxy, actors)
	})

	gameState.player.playerStore.subscribe((player) => {
		updateGame(player, gameState.actors._store.get())
	})

	if (config.title) messageBox.open(config.title)
	return initGameApi<T>(gameState, dialog, soundPlayer, ender, messageBox)
}
