import { CameraParams } from './camera.js'
import { SoundPlayerParams } from './sound.js'
import { InputsHandlerParams } from './inputs.js'
import { RendererParams } from './renderer.js'
import { GameStateParams } from './gameState/types.js'
import { MessageBoxParams } from './messageBox.js'
import { DialogParams } from './dialog.js'
import { FilterParams } from './shaders/filterSettings.js'

export type Config<T extends string> = RendererParams &
	InputsHandlerParams &
	SoundPlayerParams &
	CameraParams &
	MessageBoxParams &
	DialogParams & { filter?: FilterParams } & GameStateParams<T> & {
		title?: string | string[]
	}

export const defaultConfig: Config<string> = {
	messageBackground: '#212529',
	messageColor: '#f8f9fa',
	dialogBackground: '#212529',
	dialogColor: '#f8f9fa',
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
	cellWidth: 8,
	cellHeight: 8,
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
