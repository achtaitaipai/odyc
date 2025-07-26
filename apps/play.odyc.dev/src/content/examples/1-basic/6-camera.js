createGame({
	player: {
		sprite: `
			.6....6.
			.664466.
			44044044
			44400444
			4.4444.4
			0..44..0
			.444444.
			.4....4.
			`,
		position: [16, 17]
	},
	templates: {
		X: {
			sprite: `
			22222022
			22222022
			00000000
			22022222
			00000000
			22202222
			22202222
			00000000
			`
		},
		E: {
			end: 'The End'
		}
	},
	map: `
    XEXXXXXXXXXXXXXXXXXXXXXX
    X.XXXXXXXXXXXXXXXXXXXXXX
    X.X..................XXX
    X.X.X.XXXXXX.XXXXXXX.XXX
    X...X.XXXXXX.XXXXXXX.XXX
    XXX.X.XXXXXX.XXXXXXX.XXX
    XXX.X.XXXXXX.XXXXXXX.XXX
    XXX.X.XXXXXX.XXXXXXX.XXX
    XXX.X.XXXXXX.XXXXXXX.XXX
    XXX.X........X.......XXX
    XXXXXXXXXXXXXX.XXXXXXXXX
    X..............XXXXXXXXX
    X.XXXXXXX.XXXXXXXXXXXXXX
    X.XXXXXXX.XXXXXXXXXXXXXX
    X.....................XX
    XXXXXXXXX.XXXXXXXXXXXXXX
    XXXXXXXXX.XXXXXXXXXXXXXX
    XXX.................XXXX
    XXX.XXXXX.XXXXXXXXX.XXXX
    XXX.XXXXX...........XXXX
    XXX.XXXXXXXXXXXXXXXXXXXX
    XXX.XX................XX
    XXX....XXXXXXXXXXXXXX.XX
    XXXXXXXXXXXXXXXXXXXXXEXX
  `,
	background: 9,
	screenWidth: 12,
	screenHeight: 12,
	cameraWidth: 4,
	cameraHeight: 4
})
