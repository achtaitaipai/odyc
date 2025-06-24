import 'vitest'

interface CustomMatchers<R = unknown> {
	toMatchImageSnapshot(expected: string): Promise<R>
}

declare module 'vitest' {
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
