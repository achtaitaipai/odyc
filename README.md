# Odyc

## Getting started

1. Create a new file `mygame.html`
2. Copy and paste the code below
3. Save the file
4. Open `mygame.html` with a modern browser
5. Edit the code

```html
<!doctype html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My Game</title>
	</head>
	<body>
		<script type="module">
			import { createGame, createSound } from 'https://unpkg.com/odyc'

			const game = createGame({
				title: 'A game',
				player: {
					sprite: `
						...99...
						...88...
						.000000.
						0.0000.0
						8.0000.8
						..3333..
						..3..3..
						..0..0..
					`,
					position: [4, 4],
				},
				templates: {
					X: {
						sprite: 9,
						sound: createSound('HIT', 999),
					},
					R: {
						sprite: 6,
						dialog: 'Lorem,ipsumdolor sit amet consectetur',
						onCollide: (e) => {},
					},
					G: {
						sprite: 7,
						solid: false,
						dialog: "I'm grass.",
					},
				},
				map: `
					XXXXXXXXXXXXXXXX
					X..............X
					X...........G..X
					X..............X
					X..............X
					X....R.........X
					X..............X
					XXXXXXXXXXXXXXXX
				`,
			})
		</script>
	</body>
</html>
```

## Player

The player configuration allows you to define the characteristics and initial state of the player entity in your game. This includes specifying the player's sprite, position, and any additional properties or behaviors.

The [`sprite`](#sprite) property defines the visual appearance of the player entity.

The `position` property specifies the initial position of the player entity within the game world. It is represented as an array containing the x and y coordinates of the player's starting position.

> [!NOTE]
> Player coordinates are measured from the top-left corner of the game window.
>
> For instance:
>
> - `[0, 0]` will position the player at the top-left corner of the game window.
> - `[3, 5]` will position the player on the third cell from the left and the fifth cell from the top within the game grid.

Example:

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	player: {
		sprite: `
			...99...
			...88...
			.000000.
			0.0000.0
			8.0000.8
			..3333..
			..3..3..
			..0..0..
		`,
		position: [3, 5],
	},
	//...
})
```

## Sprite

A sprite is represented as a multi-line string, where each line corresponds to a row of pixels in the sprite.

### Character Mapping

Each character in the string represents a pixel and its color. Different characters are used to represent different colors.

- Digits (0-9): Each digit represents a unique color. For instance, '0' might represent black, '1' white, '2' gray, and so forth.

- New Lines: New lines in the string indicate the start of a new row in the sprite. Each row corresponds to a line of characters in the string.

- White spaces, tabulation and blank lines are ignored.

- Any other character represents a transparent pixel. These characters are ignored during rendering and do not contribute to the visible portion of the sprite.

> [!TIP]
> If you desire a solid rectangle as a sprite, you can simply pass a single number corresponding to the desired color.

### Size

By default, sprites are represented as squares with dimensions of 8 by 8 pixels. However, you can easily customize the size of the sprites to fit your game's requirements using the cellWidth and cellHeight keys in the game configuration.

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	cellWidth: 32,
	cellHeight: 32,
	//...
})
```

## Colors

### Default colors

| index | color  | code    |
| ----- | ------ | ------- |
| 0     | black  | #212529 |
| 1     | white  | #f8f9fa |
| 2     | gray   | #ced4da |
| 3     | blue   | #228be6 |
| 4     | red    | #fa5252 |
| 5     | yellow | #fcc419 |
| 6     | orange | #ff922b |
| 7     | green  | #40c057 |
| 8     | pink   | #f06595 |
| 9     | brown  | #a52f01 |

### Customize colors

You can customize the colors used in sprites by providing an array of ten strings parsed as [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) value. These colors can be defined based on RGB values, hexadecimal codes, or predefined color names...

Example:

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	colors: [
		'red',
		'orange',
		'lab(50% 40 59.5)',
		'hwb(12 50% 0%)',
		'#f06595',
		'#f09',
		'oklch(60% 0.15 50)',
		'hsl(150 30% 60%)',
		'light-dark(white, black)',
		'black',
	],
	//...
})
```

## Templates

In the templates configuration, you can define various elements within your game, such as obstacles, items, or interactive objects. Each template is represented by a unique identifier (e.g., 'R', 'G', '@'), and you can specify properties and behaviors for each template.

Each template item can include the following properties:

- `sprite`: (optional) Specifies the visual representation of the element. [see sprite](#sprite)
- `dialog` (optional): Defines a dialog message associated with the element.
- `sound` (optional): Specifies a sound effect associated with the element. [see sound](#sound)
- `solid` (optional): Indicates whether the element is solid or not.
- `visible` (optional): Determines if the element is visible or not.
- `end` (optional): Marks the element as a game-ending condition, triggering the end of the game when interacted with. The `end` property is a string representing the ending message displayed to the player upon encountering the element.

Example template definitions

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	templates: {
		R: {
			sprite: 6,
			sound: createSound('HIT', 999),
			visible: false,
			end: 'Game Over',
		},
		G: {
			sprite: 7,
			dialog: "I'm grass.",
			solid: false,
		},
	},
	//...
})
```

## Sound

The `sound` property in the template configuration associates sound effects with specific game elements, enhancing the player's auditory experience.

- **Creating Sound Effects**: The `createSound` function generates sound effects, taking a predefined type (`DEFAULT`, `RANDOM`, `PICKUP`, `LASER`, `EXPLOSION`, `POWERUP`, `HIT`, `JUMP` or `BLIP`) and an optional seed number for consistency, this allows for consistency in sound generation across different game sessions or platforms.

- **Volume Control**: You can adjust the overall volume of the game using the volume key, specifying a number between 0 and 1. This allows fine-tuning of the audio balance to suit the player's preferences.

#### Example Usage

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	templates: {
		G: {
			sound: createSound('HIT', 999),
			// Other template properties...
		},
	},
	volume: 0.8,
	//...
})
```

> [!NOTE]
> Sounds are generated using the remarkable [jfxr tool](https://jfxr.frozenfractal.com), offering a wide range of options for creating immersive sound effects.

## Map

The `map` configuration defines the layout of the game world using ASCII art. Each character in the ASCII art `map` corresponds to a specific template defined in the templates configuration. The `map` represents the spatial arrangement of game elements such as walls, floors, obstacles, and interactive objects.

Drawing the `map` closely resembles drawing a `sprite`:

- Each character present in a template is interpreted.
- Any character other than a template key represents a transparent pixel.
- White spaces, tabulations, and blank lines are ignored during rendering.

Example Map Definition

```js
import { createGame, createSound } from 'https://unpkg.com/odyc'

createGame({
	//...
	templates:{
		X:{
			sprite: 0
		},
		G: {
			sprite: 7
		},
		R: {
			sprite: 4
		}
	}
	map: `
		XXXXXXXXXXXXXXXX
		X..............X
		X...........G..X
		X..............X
		X..............X
		X....R.........X
		X..............X
		XXXXXXXXXXXXXXXX
	`,
	//...
})
```

## Camera

The screen size is defined by `screenWidth` and `screenHeight`. These parameters determine the number of cells visible on the screen.

By default, the camera adjusts each time the player leaves the screen.

For smoother camera movement, you can define `cameraWidth` and `cameraHeight`. These parameters determine an invisible rectangle at the center of the screen. Whenever the player moves beyond this rectangle, the camera adjusts by one cell to keep the player within the rectangle.

> [!WARNING]
> For smooth camera movement, `cameraWidth` **and** `cameraHeight` must be defined.

## Other Configuration Parameters

### Title

The `title` parameter allows you to define an introduction screen for your game, providing players with information or context before they begin playing.

### Background Color

The background color of the game is defined by `background`. The value should be a number between 0 and 9.

### Autofocus

By default, the player will need to click on the game before interacting. You can set `autoFocus` to `true` if you want to prevent this behavior.

### Controls

You can customize the keyboard controls using the `controls` parameter.

Default values are:

```javascript
controls: {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    ACTION: ['Enter', 'Space'],
}
```

Values should correspond to [valid keycodes](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values).

### Container

The `container` parameter defines the DOM element where the game will be added. By default, the game will be added to the `body`.
