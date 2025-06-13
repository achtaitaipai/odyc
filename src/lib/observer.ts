export type Observable<T = void> = {
	subscribe(callback: (e: T) => void): () => boolean
	notify(e: T): void
	clear(): void
}
export function createObservable<T = void>(): Observable<T> {
	let idCounter = 0
	const listeners = new Map<number, (e: T) => void>()
	return {
		subscribe(callback: (e: T) => void) {
			const id = idCounter++
			listeners.set(id, callback)
			return () => listeners.delete(id)
		},
		notify(e: T) {
			listeners.forEach((listener) => listener(e))
		},
		clear() {
			listeners.clear()
		},
	}
}
