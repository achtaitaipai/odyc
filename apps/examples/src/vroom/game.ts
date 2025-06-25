import { charToSprite, createGame, type Cell, vec2 } from 'odyc'
import { levels, sprites } from './assets'

export function play(levelIndex: number) {
	const { map, pos } = levels[levelIndex]
	const grid = map
		.trim()
		.replace(/[ \t]/gm, '') //removes tabs and whitespaces
		.split('\n')
	const screenHeight = grid.length
	const screenWidth = grid[1].length

	const game = createGame({
		player: {
			sprite: sprites.player,
			position: pos.value,
		},
		templates: {
			'#': {
				sprite: 1,
			},
			'<': {
				sprite: sprites.left,
				solid: false,
				onTurn: updateShip,
			},
			'>': {
				sprite: sprites.right,
				solid: false,
				onTurn: updateShip,
			},
			'^': {
				sprite: sprites.top,
				solid: false,
				onTurn: updateShip,
			},
			v: {
				sprite: sprites.bottom,
				solid: false,
				onTurn: updateShip,
			},
			'*': {
				sprite: sprites.mine,
				sound: ['FALL', 93],
				solid: false,
				end: true,
			},
			$: {
				sprite: sprites.goal,
				solid: false,
				onEnter() {
					game.playSound('POWERUP', 93)
					play(++levelIndex % levels.length)
				},
			},
		},
		map,
		screenWidth,
		screenHeight,
		cellWidth: 5,
		cellHeight: 5,
		background: 0,
		filter: {
			name: 'neon',
			settings: {
				intensity: 0.6,
			},
		},
	})

	function gameOver() {
		game.playSound('FALL', 93)
		game.end()
	}

	type ShipSymbol = '<' | '>' | '^' | 'v'

	const directions: Record<ShipSymbol, [number, number]> = {
		'<': [-1, 0],
		'>': [1, 0],
		'^': [0, -1],
		v: [0, 1],
	}
	const opposites = {
		'<': '>',
		'>': '<',
		'^': 'v',
		v: '^',
	}

	async function updateShip(target: Cell<ShipSymbol>) {
		const dir = vec2(directions[target.symbol])
		const pos = vec2(target.position)
		let dest = pos.add(dir)
		const nextCell = game.getCell(...dest.value)

		//bounce
		if (nextCell.symbol !== null) {
			const newSymbol = opposites[target.symbol]
			game.addToCell(...pos.value, newSymbol as ShipSymbol)
			dest = pos
		}
		//go forward
		else {
			game.addToCell(...dest.value, target.symbol)
			game.getCell(...pos.value).remove()
		}
		//game over
		if (
			dest.equals(game.player.position) ||
			(dest.sub(dir).equals(game.player.position) &&
				dir.multiply(-1).equals(game.player.direction))
		)
			setTimeout(gameOver)
	}
}
