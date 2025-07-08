export enum Dependencies {
	USER = 'dependency:user',
	PROFILE = 'dependency:profile',
	GAMES = 'dependency:games',
	HIGHLIGHTS = 'dependency:highlights',
	PROFILES = 'dependency:profiles'
}

export const DefaultProfilePicture = `
  99999999
  55555555
  53355335
  53355335
  55555555
  55655655
  55566555
  55555555
	`;

export const OdycColorsHEX = [
	'#212529', //black
	'#f8f9fa', //white
	'#ced4da', //gray
	'#228be6', //blue
	'#fa5252', //red
	'#fcc419', //yellow
	'#ff922b', //orange
	'#40c057', //green
	'#f06595', //pink
	'#a52f01' //brown,
];

export const OdycColorsRGB = [
	[33, 37, 41],
	[248, 249, 250],
	[206, 212, 218],
	[34, 139, 230],
	[250, 82, 82],
	[252, 196, 25],
	[255, 146, 43],
	[64, 192, 87],
	[240, 101, 149],
	[165, 47, 1]
];

export const DefaultCode = `const game = createGame({
	player: {
		sprite: \`
			...00...
			...00...
			.000000.
			0.0000.0
			0.0000.0
			..0000..
			..0..0..
			..0..0..
			\`,
		position: [3, 1]
	},
	templates: {
		x: {
			sprite: 2
		}
	},
	map: \`
	xxxxxxxx
	x......x
	x......x
	x......x
	x......x
	x......x
	x......x
	xxxxxxxx
	\`
});`;

export const TemplateGroups = [
	{
		title: 'Getting started',
		templates: [
			{ label: 'Hello world', value: 'hello-world' },
			{ label: 'Collisions', value: 'sollisions' }
		]
	},
	{
		title: 'Advanced',
		templates: [
			{ label: 'Dialog', value: 'dialog' },
			{ label: 'Sounds', value: 'sounds' }
		]
	}
];
