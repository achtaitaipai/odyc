import { CameraParams } from './camera.js'
import { SoundPlayerParams } from './soundPlayer.js'
import { InputsHandlerParams } from './inputs.js'
import { RendererParams } from './renderer.js'
import { WrapperParams } from './wrapperElement.js'
import { GameStateParams, Templates } from './gameState/types.js'

export type Config<T extends Templates> = WrapperParams &
	RendererParams &
	InputsHandlerParams &
	SoundPlayerParams &
	CameraParams &
	GameStateParams<T> & { title?: string }

export const defaultConfig: Config<{}> = {
	colors: [
		'#212529', //black
		'#f8f9fa', //white
		'#ced4da', //gray
		'#228be6', //blue
		'#fa5252', //red
		'#fcc419', //yellow
		'#ff922b', //orange
		'#40c057', //green
		'#f06595', //pink
		'#a52f01', //brown
	],
	screenWidth: 8,
	screenHeight: 8,
	tileWidth: 8,
	tileHeight: 8,
	background: 1,
	volume: 0.5,
	controls: {
		LEFT: 'ArrowLeft',
		RIGHT: 'ArrowRight',
		UP: 'ArrowUp',
		DOWN: 'ArrowDown',
		ACTION: ['Enter', 'Space'],
	},
	player: {
		sprite: 0,
	},
	templates: {},
	map: `
		........
		........
		........
		........
		........
		........
		........
		........
	`,
}
