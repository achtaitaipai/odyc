let hasOs = true

/** @return {[number,number]}*/
function randomPosition() {
	const r = Math.floor(Math.random() * 7 + 1)
	const side = Math.floor(Math.random() * 3)
	if (side === 0) return [r, 1]
	if (side === 1) return [7, r]
	if (side === 2) return [r, 7]
	return [1, r]
}

const game = createGame({
	player: {
		sprite: `
		........
		........
		99..9...
		..9..999
		..999999
		..9999..
		..9..9..
		........
	`,
		position: [2, 2]
	},

	templates: {
		x: {
			sprite: `
      55555555
      59995999
      59995999
      55555555
      99599959
      55555555
      99959995
      99959995
    `
		},
		m: {
			sprite: `
		...99...
		...55...
		.111111.
		5.1111.5
		5.1111.5
		..3333..
		..3..3..
		..9..9..
	`,
			onCollide: async function (target) {
				if (hasOs) {
					game.addToCell(...randomPosition(), 'o')
					hasOs = false
					game.playSound('POWERUP', 543534)
					game.openDialog('Go!')
				} else {
					game.openDialog('Go go!')
				}
			}
		},
		o: {
			sprite: `
      ........
      ........
      ........
      .1....1.
      ..1111..
      .1....1.
      ........
      ........
    `,
			sound: ['PICKUP', 5353],
			onCollide: function (target) {
				target.remove()
				hasOs = true
			}
		}
	},
	map: `
  xxxxxxxxx
  x.......x
  x.......x
  x.......x
  x...m...x
  x.......x
  x.......x
  x.......x
  xxxxxxxxx
  `,
	background: 7,
	screenWidth: 9,
	screenHeight: 9,
	title: '>> Dodog <<'
})
