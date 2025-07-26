const game = createGame({
	player: {
		sprite: `
			....4...
			...444..
			..44444.
			..44444.
			..70707.
			.7877787
			...888..
			..77.77.
			`,
		position: [1, 1]
	},
	templates: {
		// robot
		r: {
			sprite: `
			..0000..
			.000000.
			00000000
			01100110
			00000000
			00000000
			.066660.
			..0..0..
			`,
			dialog: `=Initialising cognitive scan...=  
|
~<4>Analyzing emotional response...<4>~  
|
Do you believe in truth?  
|
|
<5>Answer carefully.<5>  
|
|
^Hmmm...^ _Your hesitation is noted._  
|
%<3>Truth probability: 67\\%<3>%  
|
|
~Result:~ <4>Unreliable narrator detected.<4>  
|
%Recalibrating neural patterns...%   `
		},

		// wall
		x: {
			sprite: 0
		}
	},
	map: `
	xxxxxxxx
	x......x
	x......x
	x......x
	x...r..x
	x......x
	x......x
	xxxxxxxx
	`,
	background: 1,
	dialogBackground: 1,
	dialogBorder: 0,
	dialogColor: 0
})
