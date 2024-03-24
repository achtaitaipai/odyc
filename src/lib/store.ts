export type Store<T> = {
	subscribe: (callback: (value: T) => void) => () => void
	set: (newValue: T) => void
	update: (updateValue: (current: T) => T) => void
	get: () => T
}

export const createStore = <T>(initialValue: T): Store<T> => {
	let index = 0
	let value = initialValue
	const subscribers: Map<number, (value: T) => void> = new Map()

	return {
		subscribe: (callback: (value: T) => void) => {
			const subscriberIndex = index
			index++
			subscribers.set(subscriberIndex, callback)
			callback(value)
			return () => {
				subscribers.delete(subscriberIndex)
			}
		},
		set: (newValue: T) => {
			value = newValue
			subscribers.forEach((callback) => {
				callback(value)
			})
		},
		get: () => value,
		update: (updateValue) => {
			value = updateValue(value)
			subscribers.forEach((callback) => {
				callback(value)
			})
		},
	}
}
