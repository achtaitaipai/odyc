import { Position } from '../types.js'
import { GameStateParams, Templates } from './types.js'

type SymbolorPosition<T extends Templates> = [keyof T] | [number, number]

export const createCounts = <T extends Templates>(
	params: Omit<GameStateParams<T>, 'player'>,
) => {
	const collisionCount = new Map<string, number>()
	const enterCount = new Map<string, number>()
	const leaveCount = new Map<string, number>()

	const _reset = () => {
		collisionCount.clear()
		enterCount.clear()
		leaveCount.clear()
	}

	const incrMap = (
		symbol: keyof T,
		position: Position,
		map: Map<string, number>,
	) => {
		const positionKey = position.join('-')
		map.set(String(symbol), (map.get(String(symbol)) ?? 0) + 1)
		map.set(positionKey, (map.get(positionKey) ?? 0) + 1)
	}

	return {
		getCollision: (...args: SymbolorPosition<T>) =>
			collisionCount.get(args.join('-')) ?? 0,
		getEnter: (...args: SymbolorPosition<T>) =>
			enterCount.get(args.join('-')) ?? 0,
		getLeave: (...args: SymbolorPosition<T>) =>
			leaveCount.get(args.join('-')) ?? 0,
		_incrCollision: (symbol: keyof T, position: Position) => {
			incrMap(symbol, position, collisionCount)
		},
		_incrEnter: (symbol: keyof T, position: Position) => {
			incrMap(symbol, position, enterCount)
		},
		_incrLeave: (symbol: keyof T, position: Position) => {
			incrMap(symbol, position, leaveCount)
		},
		_reset,
	}
}
