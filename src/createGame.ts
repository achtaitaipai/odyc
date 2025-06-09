import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initEnder } from './ender.js'
import { initFilter } from './filter.js'
import { initGameApi } from './gameApi.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { ActorState, Player } from './gameState/types.js'
import { initInputsHandler } from './inputs.js'
import { debounce } from './lib'
import { initMessageBox } from './messageBox.js'
import { initPrompt } from './prompt.js'
import { initRenderer } from './renderer.js'
import { Uniforms } from './shaders/filterSettings.js'
import { initSoundPlayer } from './sound.js'

export const createGame = <T extends string>(
	userConfig?: Partial<Config<T>>,
) => {
	const config: Config<T> = Object.assign({}, defaultConfig, userConfig)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const camera = initCamera(config)
	const renderer = initRenderer(config)
	const dialog = initDialog(config)
	const prompt = initPrompt(config)
	const messageBox = initMessageBox(config)
	const gameFilter = initFilter(renderer.canvas, config.filter)
	const ender = initEnder({ gameState, messageBox, camera })

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

	const updateGame = debounce(() => {
		gameFilter?.setUniforms(gameState.uniformsStore?.get())
		camera.update(
			gameState.player.playerProxy.position,
			gameState.mapStore.getDimensions(),
		)
		gameState.actors._store.silentUpdate((actors) => {
			return actors.map((el) => {
				const onScreen = camera.isOnScreen(el.position)

				if (onScreen !== el.onScreen) {
					const target = gameState.actors.getCell(...el.position)
					if (onScreen) el.onScreenEnter?.(target)
					else el.onScreenLeave?.(target)
				}
				el.onScreen = onScreen
				return el
			})
		})
		renderer.render(
			[...gameState.actors._store.get(), gameState.player.playerProxy],
			camera,
		)
		gameFilter?.render()
	}, 60)

	gameState.actors._store.subscribe(updateGame)

	gameState.player.playerStore.subscribe(updateGame)

	gameState.uniformsStore.subscribe(updateGame)

	if (config.title) messageBox.open(config.title)
	return initGameApi<T>(
		gameState,
		dialog,
		prompt,
		soundPlayer,
		ender,
		messageBox,
	)
}
