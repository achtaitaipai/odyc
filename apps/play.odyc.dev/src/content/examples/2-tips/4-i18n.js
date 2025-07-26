const texts = {
	en: {
		robot: 'Are you  a robot?'
	},
	fr: {
		robot: 'Êtes-vous un robot?'
	}
}

/** @typedef {keyof typeof texts} Lang */

/** @param{Lang} value */
function setLang(value) {
	lang = value
}

/** @param {keyof typeof texts[Lang]} key */
function t(key) {
	const res = texts[lang][key] ?? key
	return res
}

/** @type {Lang} */
let lang = 'en'

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
			onCollide() {
				game.openDialog(t('robot'))
			}
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
})

game.openMenu({
	English: () => (lang = 'en'),
	Français: () => (lang = 'fr')
})
