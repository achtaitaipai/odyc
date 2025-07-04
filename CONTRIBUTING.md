# Contributing to Odyc.js

Thank you for your interest in contributing to Odyc.js!

## Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Install browser dependencies**: `npx playwright install`
4. **Build the library**: `npm run build`

## Development

### Making Changes

- **Library code**: Work in `packages/odyc/src/`
- **Examples**: Add demos in `apps/examples/`
- **Documentation site**: Update `apps/odyc.dev/`
- **Tests**: Add tests in `tests/odyc-e2e/`

### Commands

```bash
# Watch library changes
cd packages/odyc && npm run dev

# Work on documentation site
cd apps/odyc.dev && npm run dev

# Run tests
npm run test

# Check everything
npm run lint && npm run test:once
```

## Submitting

1. **Create a branch** for your changes
2. **Add tests** for new features
3. **Make sure tests pass**: `npm run test:once`
4. **Submit a pull request**

## Guidelines

- Keep changes **small and focused**
- Follow existing **code patterns**
- Add **tests** for new functionality
- Write **clear commit messages**

## Need Help?

- Check the [documentation](https://odyc.dev)
- Open an issue for questions
- Look at existing code for examples

Happy coding! 🚀

