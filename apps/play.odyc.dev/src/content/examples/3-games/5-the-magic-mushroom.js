const fragment = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_texCoords;

uniform float u_intensity;

void main() {
  vec2 uv = vec2(0.);
  uv.x = v_texCoords.x +sin(v_texCoords.y * 30.) *.1 * u_intensity;
  uv.y = v_texCoords.y +sin(v_texCoords.x * 30.) *.1 * u_intensity;
  gl_FragColor = texture2D(u_texture, uv);
}
`
const TIME_BEFORE_LOSE = 3000
let score = 0
/** @type number */
let timeoutIntervalId

let filterIntensity = 0

const game = createGame({
	player: {
		sprite: `
			...44...
			...88...
			...88...
			.434434.
			4.3443.4
			1.3333.1
			..3333..
			..3..3..
			`,
		position: [2, 2]
	},

	templates: {
		x: {
			sprite: `
      00000000
      09990999
      09990999
      00000000
      99099909
      00000000
      99909990
      99909990
    `
		},
		o: {
			sprite: `
		..1414..
		.144441.
		44414444
		44441444
		14444441
		...55...
		...55...
		...55...
	`,
			sound: ['BLIP', 5353],
			onCollide: function (target) {
				target.remove()
				game.addToCell(...randomPosition(target.position), 'o')
				filterIntensity = filterIntensity === 0 ? 0.1 : filterIntensity * -1.1
				game.updateFilter({
					intensity: filterIntensity
				})
				clearTimeout(timeoutIntervalId)
				score++
				timeoutIntervalId = setTimeout(() => {
					filterIntensity = 0
					game.updateFilter({
						intensity: filterIntensity
					})
					game.end('°GAME OVER', 'Score: ' + score)
					score = 0
				}, TIME_BEFORE_LOSE)
			}
		}
	},
	map: `
  xxxxxxxxx
  x.......x
  x.......x
  x.......x
  x...o...x
  x.......x
  x.......x
  x.......x
  xxxxxxxxx
  `,
	background: 0,
	screenWidth: 9,
	screenHeight: 9,
	filter: {
		fragment,
		settings: {}
	},
	title:
		'_~ <3>T<3><4>h<4><5>e<5> <6>M<6><7>a<7><8>g<8><3>i<3><4>c<4> <5>M<5><6>u<6><7>s<7><8>h<8><3>r<3><4>o<4><5>o<5><6>m<6> '
})

/**
 * @param position {[number,number]}
 * @return {[number,number]}
 */
function randomPosition(position) {
	let [x, y] = position
	let [newX, newY] = [x, y]
	while (
		(newX === x && newY === y) ||
		(newX === game.player.position[0] && newY === game.player.position[1])
	)
		[newX, newY] = [Math.floor(Math.random() * 7 + 1), Math.floor(Math.random() * 7 + 1)]
	return [newX, newY]
}
