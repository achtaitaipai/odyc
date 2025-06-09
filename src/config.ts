import { CameraParams } from './camera.js'
import { DialogParams } from './dialog.js'
import { GameStateParams } from './gameState/types.js'
import { InputsHandlerParams } from './inputs.js'
import { MessageBoxParams } from './messageBox.js'
import { RendererParams } from './renderer.js'
import { FilterParams } from './shaders/filterSettings.js'
import { SoundPlayerParams } from './sound.js'

export type Config<T extends string> = RendererParams &
	InputsHandlerParams &
	SoundPlayerParams &
	CameraParams &
	MessageBoxParams &
	DialogParams & { filter?: FilterParams } & GameStateParams<T> & {
		title?: string | string[]
	} & {
		container: HTMLElement
	}

export const defaultConfig: Config<string> = {
	container: document.body,
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
	messageBackground: 0,
	messageColor: 1,
	dialogBackground: 0,
	dialogColor: 1,
	dialogBorder: 1,
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
}
