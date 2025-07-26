const game = createGame({
	player: {
		sprite: `
			...00...
			...00...
			.000000.
			0.0000.0
			0.0000.0
			..0000..
			..0..0..
			..0..0..
			`,
		position: [3, 1]
	},
	templates: {
		x: {
			sprite: 2
		}
	},
	map: `
	xxxxxxxx
	x......x
	x......x
	x......x
	x......x
	x......x
	x......x
	xxxxxxxx
	`
})
