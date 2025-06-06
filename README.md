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
		position: [3, 1]
	},
	templates: {
		x: { sprite: 2 }
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
})
```
