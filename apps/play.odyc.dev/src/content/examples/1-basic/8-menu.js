const game = createGame({
	player: {
		sprite: `
			........
			..0770..
			.077770.
			07777770
			0.0770.0
			0..77..0
			07077070
			.0.00.0.
			`,
		position: [3, 1]
	},
	templates: {
		x: {
			sprite: 9
		},
		d: {
			sprite: `
			22222222
			22223332
			20023332
			20023332
			20023332
			20023332
			22223332
			22222222
			`,
			async onCollide() {
				await game.openMenu({
					Withdraw: {
						$20: () => game.openMessage('You have withdrawn $20'),
						$50: () => game.openMessage('You have withdrawn $50'),
						$100: () => game.openMessage('You have withdrawn $100')
					},
					Balance: () => game.openMessage('Your balance is $1234.56'),
					Settings: {
						PIN: () => game.openMessage('PIN change is not available right now'),
						Lang: () => game.openMessage('Language settings coming soon')
					},
					Cancel: null
				});
			}
		}
	},
	map: `
	xxxxxxxx
	x......x
	x......x
	x......d
	x......x
	x......x
	x......x
	xxxxxxxx
	`
});
