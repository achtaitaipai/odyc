const cellWidth = 9
const cellHeight = 8
const screenWidth = 8
const screenHeight = 8

const levels = /**@type {const}*/ ([
	{
		map: `
		........
		.######.
		.######.
		.##XX##.
		.##XX##.
		.######.
		.######.
		........
	  `,
		playerPos: [3, 0]
	},
	{
		map: `
		........
		.######.
		.#X#XX#.
		.#X##X#.
		.####X#.
		.#XXXX#.
		.######.
		........
	  `,
		playerPos: [3, 0]
	},
	{
		map: `
		........
		.######.
		.######.
		.##X###.
		.####X#.
		.######.
		.###X##.
		........
		`,
		playerPos: [3, 0]
	},
	{
		map: `
		........
		.####X#.
		.#X##X#.
		.######.
		.#X####.
		.####X#.
		.#X####.
		........
	  `,
		playerPos: [3, 0]
	},
	{
		map: `
	  ........
	  .######.
	  .X#X##X.
	  .######.
	  .######.
	  .#X#X##.
	  .######.
	  ........
	`,
		playerPos: [3, 0]
	}
])

let levelIndex = 0

const sprites = {
	player: `
		..151...
		..555...
		...5....
		.53335..
		5.333.9.
		..3.3.9.
		..3.3.9.
		..3.3666
	`,
	cleanFloor: 2,
	dirtyFloor: `
		222222222
		222222222
		229999292
		929222292
		222222222
		222222222
		299992222
		222299222
	`,
	wall: `
		000000000
		022222220
		020000020
		020020020
		020020020
		020000020
		022222220
		000000000
	`
}

const game = createGame({
	player: {
		sprite: sprites.player,
		position: levels[0].playerPos
	},
	templates: {
		'.': {
			solid: false,
			onEnter: function () {
				for (let y = 0; y < game.height; y++) {
					for (let x = 0; x < game.width; x++) {
						const cell = game.getCell(x, y)
						if (cell.symbol === '#') return
					}
				}
				levelIndex = (levelIndex + 1) % levels.length
				const { map, playerPos } = levels[levelIndex]
				game.loadMap(map, [...playerPos])
				if (levelIndex === 0) game.end('Nice job!\n\nEverything’s clean!')
			}
		},
		'#': {
			sprite: sprites.dirtyFloor,
			solid: false,
			sound: ['BLIP', 424245453],
			onEnter: function (target) {
				game.addToCell(...target.position, '$')
			}
		},
		$: {
			sprite: sprites.cleanFloor,
			solid: false,
			sound: ['FALL', 424245453],
			onEnter: async function (target) {
				game.addToCell(...target.position, '#')
				await game.openDialog('Oh no, I got it dirty again!')
				game.end()
			}
		},
		X: {
			sprite: sprites.wall
		}
	},
	map: levels[0].map,
	screenWidth,
	screenHeight,
	cellWidth,
	cellHeight,
	background: 0,
	volume: 0.04,
	title: 'The sweeper with the dirty shoes'
})
