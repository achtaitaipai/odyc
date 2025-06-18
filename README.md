# odyc.js

**Odyc.js** is a tiny JavaScript library designed to create narrative games by combining pixels, sounds, text, and a bit of logic.
Everything is built through code, but without unnecessary complexity: your entire game can fit in a single file.

🔗 **Get started** → [https://odyc.dev](https://odyc.dev)

### Installation

```bash
npm install odyc
```

### Quick example

```js
import { createGame } from 'odyc'

const game = createGame({
	player: {
		sprite: `
			...00...
			...00...
			.000000.
			0.0000.0
			0.0000.0
			..0000..
			..0..0..
			..0..0..
		`,
		position: [3, 1],
	},
	templates: {
		x: { sprite: 2 },
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
	`,
})
```

## Contributing

### Tests

#### Writing tests

1. Decide if test is `visual` or `functional`, and based on that, enter correct directory in `./tests/`.

> Visual is test that ensures pixels on screen has correct color. Functional is test that ensures state of game (like player position)

2. Copy any existing test, ideally similar to yours, as a "template". Make sure to update:

- Folder name
- Test name in `index.test.js`
- Test code itself (assertions)
- Test game code in `index.js`

3. Run test to ensure it passes (explained in section below)

Tips and tricks:

- When test fails, a screenshot will be generated for you in `__screenshots__` folder inside test directory. This is screenshot from the moment test failed, and can help you understand what is current status of game.
- Write failure tests too, not only success ones. For example, when testing color renders correctly, also try some non-existing color, and ensure it doesnt render. If needed, you can also expect an exception being thrown.
- Relay on game state itself as much as possible, like player's position, cell value, and such. If not possible, use `state` created exactly for this purpose - you can take inspiration from `template-event-enter` test.

#### Running tests

1. Install dependencies: `npm install`
2. Install headless browser: `npx playwright install`
3. Build Odyc.js: `npm run build`
4. Run tests: `npm run test`
