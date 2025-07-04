import { CellFacade } from './gameState/cellFacade.js'
import { Player } from './gameState/player.js'
import { CellParams, CellQuery } from './gameState/types.js'
import { MenuOption } from './prompt.js'
import { Uniforms } from './shaders/filterSettings.js'
import { PlaySoundArgs } from './sound.js'

export type Tile = string | number

export type Position = [number, number]

export type Unwrap<T> = {
	[K in keyof T]: T[K]
} & {}

export type UnTuplify<T> = T extends [infer U] ? U : T

export interface GameApi<T extends string> {
	/**
	 * @deprecated use getCellAt instead
	 */
	getCell: (x: number, y: number) => CellFacade<T>
	/**
	 * @deprecated use setCellAt instead
	 */
	addToCell: (x: number, y: number, symbol: T) => void
	/**
	 * @deprecated use updateCellAt instead
	 */
	setCell: (x: number, y: number, params: CellParams) => void
	/**
	 * @deprecated use clearCellAt instead
	 */
	clearCell: (x: number, y: number) => void
	/**
	 * @deprecated use getCells
	 */
	getAll: (symbol: T) => CellFacade<T>[]
	/**
	 * @deprecated use updateCells
	 */
	setAll: (symbol: T, params: CellParams) => void

	player: Player['facade']
	getCellAt: (x: number, y: number) => CellFacade<T>
	setCellAt: (x: number, y: number, symbol: T) => void
	updateCellAt: (x: number, y: number, params: CellParams) => void
	clearCellAt: (x: number, y: number) => void
	getCells: (query: CellQuery<T>) => CellFacade<T>[]
	setCells: (query: CellQuery<T>, symbol: T) => void
	updateCells: (query: CellQuery<T>, params: CellParams) => void
	clearCells: (query: CellQuery<T>) => void
	sendMessageToCells: (query: CellQuery<T>, message?: any) => void
	openDialog: (text: string) => Promise<void>
	prompt: (...options: string[]) => Promise<number>
	openMenu: (options: MenuOption) => Promise<void>
	openMessage: (...args: string[]) => Promise<void> | undefined
	playSound: (...args: PlaySoundArgs) => Promise<void>
	end: (...messages: string[]) => void
	loadMap: (map: string, playerPosition?: Position) => void
	updateFilter: (uniforms: Uniforms) => void
	width: number
	height: number
	turn: number
	clear: (color?: number | string) => void
}
