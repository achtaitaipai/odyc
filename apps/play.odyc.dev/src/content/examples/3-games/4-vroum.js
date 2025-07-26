document.body.style.setProperty('background', 'black');
let levelIndex = 0;

const sprites = {
	player: `
    11111
    1.1.1
    11111
    .1.1.
    .1.1.
  `,
	left: `
    ..4..
    .44..
    44444
    .44..
    ..4..
  `,
	right: `
    ..4..
    ..44.
    44444
    ..44.
    ..4..
  `,
	top: `
    ..4..
    .444.
    44444
    ..4..
    ..4..
  `,
	bottom: `
    ..4..
    ..4..
    44444
    .444.
    ..4..
  `,
	bomb: `
    4.4.4
    ..4..
    44444
    ..4..
    4.4.4
  `,
	win: `
    ..5..
    .555.
    55555
    .555.
    ..5..
  `
};

const levels = [
	{
		map: `
    ................
    ................
    ....##########..
    ....#$.......#..
    .######*.*.*.#..
    .#...........#..
    .#...*.......#..
    .#...........#..
    .#...*.......#..
    .#############..
    ................
    ................
    ................
    ................
    ................
    ................
    `,
		playerX: 2,
		playerY: 7
	},
	{
		map: `
    ................
    ................
    ................
    ................
    ##############..
    #............###
    #.............$#
    ####...v.....###
    ...###########..
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    `,
		playerX: 1,
		playerY: 6
	},
	{
		map: `
    ................
    ................
    ................
    ................
    ################
    #..............#
    #....v...^....$#
    #..............#
    ################
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    `,
		playerX: 1,
		playerY: 6
	},
	{
		map: `
    ................
    ................
    ................
    ................
    ################
    #....v.........#
    #........^....$#
    #..............#
    #......^.......#
    ################
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    `,
		playerX: 1,
		playerY: 6
	},
	{
		map: `
    ################
    #vvvv.vvvvvvvvv#
    #..............#
    #..............#
    #..............#
    #..............#
    #..............#
    #..............#
    #>.............#
    #..............#
    #..............#
    #..............#
    #^^^^.^^^^^^^^^#
    #####.##########
    #......$.......#
    ################
    `,
		playerX: 5,
		playerY: 4
	},
	{
		map: `
    ################
    #..............#
    #.############v#
    #.#..........#.#
    #.#.....######.#
    #.#.....#......#
    #.#.....#......#
    #.#.....#####.##
    #.#............#
    #.##############
    #..^...........#
    #..............#
    #..............#
    #..............#
    #^.^....$......#
    ################
    `,
		playerX: 7,
		playerY: 3
	},
	{
		map: `
    ................
    ################
    #.........$.####
    #...........#.##
    #.###########.##
    #.........>....#
    ##############.#
    #>....v........#
    #>...v.........#
    #>..v..........#
    #>..^..........#
    #>...^.........#
    #>....^........#
    ################
    ................
    ................
    `,
		playerX: 2,
		playerY: 9
	}
];

let oldPlayerPos = [levels[levelIndex].playerX, levels[levelIndex].playerY];

const nextLevel = async () => {
	await game.playSound('POWERUP');
	levelIndex = (levelIndex + 1) % levels.length;
	const level = levels[levelIndex];
	game.loadMap(level.map, [level.playerX, level.playerY]);
	oldPlayerPos = [levels[levelIndex].playerX, levels[levelIndex].playerY];
};

const loose = () => {
	game.playSound('FALL');
	game.end();
};

const directions = {
	'^': [0, -1],
	v: [0, 1],
	'>': [1, 0],
	'<': [-1, 0]
};

async function update() {
	const arrows = [
		...game.getAll('<'),
		...game.getAll('>'),
		...game.getAll('v'),
		...game.getAll('^')
	];
	const [playerX, playerY] = game.player.position;
	let gameOver = false;
	arrows.forEach((el) => {
		const [posX, posY] = el.position;
		const symbol = el.symbol;
		if (!(symbol === '<' || symbol === '>' || symbol === '^' || symbol === 'v')) return;
		const [dirX, dirY] = symbol ? directions[symbol] : [0, 0];
		const nextCell = game.getCell(posX + dirX, posY + dirY);
		if (nextCell.symbol !== '.') {
			const newSymbols = /** @type {const} */ ({
				'<': '>',
				'>': '<',
				'^': 'v',
				v: '^'
			});
			if (playerX === posX && playerY === posY) {
				gameOver = true;
			}
			game.addToCell(posX, posY, newSymbols[symbol]);
		} else {
			if (
				(playerX === posX + dirX && playerY === posY + dirY) ||
				(oldPlayerPos[0] === posX + dirX &&
					oldPlayerPos[1] === posY + dirY &&
					playerX === posX &&
					playerY === posY)
			) {
				gameOver = true;
			}
			game.addToCell(...el.position, '.');
			game.addToCell(posX + dirX, posY + dirY, symbol);
		}
	});
	if (gameOver) loose();
	oldPlayerPos = game.player.position;
}

const game = createGame({
	player: {
		position: [levels[levelIndex].playerX, levels[levelIndex].playerY],
		sprite: sprites.player
	},
	templates: {
		'#': {
			sprite: 2
		},
		'.': {
			sprite: 0,
			solid: false,
			onEnter: update
		},
		'*': {
			onCollide: loose,
			sprite: sprites.bomb
		},
		'^': {
			sprite: sprites.top,
			solid: false,
			onEnter: update
		},
		v: {
			sprite: sprites.bottom,
			solid: false,
			onEnter: update
		},
		'>': {
			sprite: sprites.right,
			solid: false,
			onEnter: update
		},
		'<': {
			sprite: sprites.left,
			solid: false,
			onEnter: update
		},
		$: {
			sprite: sprites.win,
			solid: false,
			onEnter: nextLevel
		}
	},
	map: levels[levelIndex].map,
	cellHeight: 5,
	cellWidth: 5,
	background: 0,
	screenHeight: 16,
	screenWidth: 16,
	filter: {
		name: 'neon',
		settings: {
			scale: 0.8,
			intensity: 0.6
		}
	}
});
