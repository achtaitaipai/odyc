const game = createGame({
	player: {
		sprite: 0,
		position: [1, 1]
	},
	templates: {
		x: {
			sprite: 2
		},
		p: {
			sprite: 3,
			onCollide(target) {
				const [px, py] = game.player.position;
				const [tx, ty] = target.position;
				const [dx, dy] = [tx - px, ty - py];
				const nextCell = game.getCell(tx + dx, ty + dy);
				if (!nextCell.solid) {
					game.addToCell(tx + dx, ty + dy, target.symbol);
					game.player.position = [tx, ty];
					target.remove();
				}
			}
		}
	},
	map: `
	xxxxxxxx
	x......x
	x......x
	x......x
	x...p..x
	x...x..x
	x......x
	xxxxxxxx
	`,
	background: 1
});
