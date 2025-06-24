let promise: Promise<void> | null = null
let resolvePromise: (() => void) | null = null

export const tick = (): Promise<void> => {
	if (!promise) {
		promise = new Promise<void>((resolve) => {
			resolvePromise = resolve
		})
	}
	return promise
}

export const resolveTick = (): void => {
	if (resolvePromise) {
		resolvePromise()
		promise = null
		resolvePromise = null
	}
}
