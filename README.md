# odyc.js

**Odyc.js** is a tiny JavaScript library designed to create narrative games by combining pixels, sounds, text, and a bit of logic.
Everything is built through code, but without unnecessary complexity: your entire game can fit in a single file.

🔗 **Get started** → [https://odyc.dev](https://odyc.dev)

## Contributing

### Tests

#### Writing tests

1. Decide if test is `visual` or `functional`, and based on that, enter correct directory in `./tests/`.

> Visual is test that ensures pixels on screen has correct color. Functional is test that ensures state of game (like player position)

2. Copy any existing test, ideally similar to yours, as a "template". Make sure to update:

- Test directory name
- Test test description in `test()` parameter in `index.test.js`
- Test code itself (assertions)
- Test game code in `index.js`

3. Run test to ensure it passes (explained in section below)

Follow these rules when writing tests:

- Write mostly `functional` tests. Only use `visual` tests when necessary, and keep them minimal.
- Write small test files. You can do many assertions, but make sure they tell a story together.
- All tests should assert failures as well. Ensure such "problem" behaves as expected.
- Relay on game state. If not possible, use `state` object.
- Visual tests generate first snapshot. Ensure it looks as expected, or delete it and try again.

Tips and tricks:

- Failed tests generate image in `__screenshots__`, to show state in which it failed.
- Keep CLI with tests running. Only changed tests will re-run, making experience quicker.

#### Running tests

1. Install dependencies: `npm install`
2. Install headless browser: `npx playwright install`
3. Build Odyc.js: `npm run build`
4. Run tests: `npm run test`
