export function createSingleton<T, U extends any[]>(create: (...args: U) => T) {
	const map = new Map<string | null, T>()
	const get = (key: string | null, ...args: U) => {
		const item = map.get(key)
		if (item) return item
		const newItem = create(...args)
		map.set(key, newItem)
		return newItem
	}
	return get
}
