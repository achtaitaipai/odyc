export const debounce = <T extends any[]>(
	func: (...args: T) => any,
	time: number,
) => {
	let timer: number
	return (...args: T) => {
		clearTimeout(timer)
		setTimeout(() => {
			func(...args)
		}, time)
	}
}
