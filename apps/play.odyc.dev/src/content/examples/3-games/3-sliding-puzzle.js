const game = createGame({
	player: {
		sprite: 0,
		position: [7, 7]
	},
	templates: {
		0: {
			sprite: 0,
			onCollide
		},
		1: {
			sprite: 1,
			onCollide
		},
		2: {
			sprite: 2,
			onCollide
		},
		3: {
			sprite: 3,
			onCollide
		},
		4: {
			sprite: 4,
			onCollide
		},
		5: {
			sprite: 5,
			onCollide
		},
		6: {
			sprite: 6,
			onCollide
		},
		7: {
			sprite: 7,
			onCollide
		},
		8: {
			sprite: 8,
			onCollide
		},
		9: {
			sprite: 9,
			onCollide
		}
	},
	map: `
			55553333
			55553333
			55553333
			55553333
			88887777
			88887777
			88887777
			88887777
			`,
	controls: {
		RIGHT: 'ArrowLeft',
		LEFT: 'ArrowRight',
		DOWN: 'ArrowUp',
		UP: 'ArrowDown',
		ACTION: ['Enter', 'Space']
	},
	background: 2
})

/** @param target{import('odyc').Actor}*/
function onCollide(target) {
	game.addToCell(...game.player.position, target.symbol)
	game.player.position = target.position
	target.remove()
}
