# odyc.js

**Odyc.js** is a tiny JavaScript library designed to create narrative games by combining pixels, sounds, text, and a bit of logic.
Everything is built through code, but without unnecessary complexity: your entire game can fit in a single file.

🔗 **Get started** → [https://odyc.dev](https://odyc.dev)

## Project Structure

This is a monorepo with the following structure:

- **packages/odyc/** - The main library package
- **apps/examples/** - Development and demo applications
- **tests/odyc-e2e/** - End-to-end testing suite

## Contributing

We welcome contributions to Odyc.js! Whether you're fixing bugs or adding features your help is appreciated.

### Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Install browser dependencies**: `npx playwright install`
4. **Build the library**: `npm run build`
5. **Run tests**: `npm run test`

### Development Workflow

#### Monorepo Commands (from root)

- **Build library**: `npm run build`
- **Type check all workspaces**: `npm run lint`
- **Run e2e tests**: `npm run test` (watch mode) or `npm run test:once`
- **Format code**: `npm run format`
- **Check formatting**: `npm run format:check`

#### Library Package Commands (from packages/odyc/)

- **Development mode**: `npm run dev` (watches for changes and rebuilds)
- **Type checking**: `npm run lint`
- **Build library**: `npm run build`
- **Run unit tests**: `npm run test` (watch mode) or `npm run test:once`
- **Run all checks**: `npm run prepublishOnly` (lint + build + test)

### Submitting Changes

1. **Create a branch** for your feature or fix
2. **Make your changes** following existing patterns
3. **Add tests** for new functionality
4. **Ensure all tests pass**: `npm run test:once`
5. **Check code quality**: `npm run lint && npm run format:check`
6. **Submit a pull request** with a clear description of your changes

### Tests

Tests are located in the `tests/odyc-e2e/` workspace. See [tests/odyc-e2e/README.md](tests/odyc-e2e/README.md) for detailed testing guidelines.
