const game = createGame({
	player: {
		sprite: `
			........
			..3333..
			..3030..
			.333433.
			.333333.
			..3333..
			..3..3..
			.33..33.
			`,
		position: [1, 1]
	},
	templates: {
		x: {
			sprite: 2
		},
		k: {
			sprite: `
			........
			........
			.....555
			.....5.5 
			555555.5
			5.5..5.5
			5....555
			........
			`,
			onCollide(target) {
				target.remove()
				game.setAll('d', {
					solid: false,
					dialog: null
				})
			}
		},
		d: {
			sprite: `
			...99...
			..9999..
			.999999.
			.999999.
			.999999.
			.999909.
			.999999.
			.999999.
			`,
			dialog: 'It looks closed.',
			onEnter(target) {
				target.remove()
			}
		}
	},
	map: `
	xxxxxxxx
	x....k.x
	x......x
	x......x
	x......x
	xxxdxxxx
	x......x
	xxxxxxxx
	`,
	background: 1
})
