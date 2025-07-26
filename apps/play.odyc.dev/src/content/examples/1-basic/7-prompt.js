const game = createGame({
	player: {
		sprite: `
			........
			........
			........
			..0770..
			..7447..
			.077770.
			08888880
			..0..0..
			`,
		position: [3, 1]
	},
	templates: {
		x: {
			sprite: 9
		},
		t: {
			sprite: `
			..8888..
			.888888.
			88088088
			88388388
			88888888
			88899888
			.888888.
			44888844
			`,
			async onCollide() {
				await game.openDialog('How are you?')
				const res = await game.prompt('Great!', 'Meh..', 'Good', 'Bad!')
				if (res === 0 || res === 2) game.openDialog('Glad to hear it!')
				else game.openDialog('Sorry to hear that...')
			}
		}
	},
	map: `
	xxxxxxxx
	x......x
	x......x
	x......x
	x......x
	x....t.x
	x......x
	xxxxxxxx
	`
})
