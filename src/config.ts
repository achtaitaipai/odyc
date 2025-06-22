import { CameraParams } from './camera.js'
import { SoundPlayerParams } from './sound.js'
import { InputsHandlerParams } from './inputs.js'
import { RendererParams } from './renderer.js'
import { GameStateParams } from './gameState/types.js'
import { MessageBoxParams } from './messageBox.js'
import { DialogParams } from './dialog.js'
import { FilterParams } from './shaders/filterSettings.js'

/**
 * Game configuration object for Odyc.js games.
 * All properties are optional and will use sensible defaults if not provided.
 *
 * @template T - String literal type for actor template keys used in the map
 * @example
 * ```typescript
 * const config = {
 *   player: { sprite: 0, position: [2, 3] },
 *   templates: {
 *     x: { solid: true, sprite: 4, onCollide: (target) => target.remove() }
 *   },
 *   map: `
 *     ........
 *     ..x.....
 *     ........
 *   `,
 *   colors: ['#000', '#fff', '#f00'],
 *   filter: { name: 'crt' }
 * }
 * ```
 */
export type Config<T extends string> = RendererParams &
	InputsHandlerParams &
	SoundPlayerParams &
	CameraParams &
	MessageBoxParams &
	DialogParams & { filter?: FilterParams } & GameStateParams<T> & {
		/** Game title displayed at the start of the game */
		title?: string | string[]
	}

export const defaultConfig: Config<string> = {
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
		LEFT: ['KeyA', 'ArrowLeft'],
		RIGHT: ['KeyD', 'ArrowRight'],
		UP: ['KeyW', 'ArrowUp'],
		DOWN: ['KeyS', 'ArrowDown'],
		ACTION: ['Enter', 'Space'],
	},
}
