const game = createGame({
	player: {
		sprite: `
			.7....7.
			..7..7..
			..7..7..
			..0770..
			.777777.
			7.7887.7
			..7777..
			.77..77.
			`,
		position: [1, 1]
	},
	templates: {
		// robot
		r: {
			sprite: `
			........
			.222222.
			.322232.
			.422242.
			.222222.
			.222222.
			..2..2..
			.22.22..
			`,
			dialog: 'Are you a robot?'
		},

		// wall
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
	x....r.x
	x......x
	xxxxxxxx
	`,
	background: 9
});
