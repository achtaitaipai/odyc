import { charToSprite, createGame, vec2 } from 'odyc'

const width = 20
const height = 20

const game = createGame({
	player: {
		position: [1, 1],
		sprite: charToSprite('@'),
	},
	templates: {
		'#': ([x, y]) => ({
			sprite: charToSprite('#'),
			onCollide() {
				const playerPos = vec2(game.player.position)
				if (x === 0)
					game.player.position = playerPos.add(game.width - 3, 0).value
				if (y === 0)
					game.player.position = playerPos.add(0, game.height - 3).value
				if (x === game.width - 1)
					game.player.position = playerPos.sub(game.width - 3, 0).value
				if (y === game.height - 1)
					game.player.position = playerPos.sub(0, game.height - 3).value
			},
		}),
	},
	map: drawRoom(width, height),
	screenWidth: width,
	screenHeight: height,
})

function drawRoom(width: number, height: number) {
	let map: string[] = []
	for (let y = 0; y < height; y++) {
		if (y === 0 || y === height - 1) {
			map.push(Array(width).fill('#').join(''))
			continue
		}
		const row = Array(width).fill('.')
		row[0] = '#'
		row[width - 1] = ['#']
		map.push(row.join(''))
	}
	return map.join('\n')
}
