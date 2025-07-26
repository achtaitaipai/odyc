const FPS = 3;

const animation = [
	`
			...00...
			...00...
			..0000..
			.000000.
			.000000.
			.000000.
			..0..0..
			..0..0..
			`,
	`
			...00...
			...00...
			..0000..
			.000000.
			0.0000.0
			0.0000.0
			..0..0..
			..0..0..
			`
];

const game = createGame({
	player: {
		sprite: animation[0],
		position: [2, 1]
	},
	templates: {
		x: {
			sprite: 5
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
});

/**
 * @param {number} now
 */
function animate(now) {
	const sprite = animation[Math.floor((now * 3) / 1000) % animation.length];
	if (sprite !== game.player.sprite) {
		game.player.sprite = sprite;
	}
	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
