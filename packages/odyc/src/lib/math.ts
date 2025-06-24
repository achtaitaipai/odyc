export const clamp = (min: number, max: number, value: number) =>
	Math.max(min, Math.min(value, max))

export const modulo = (value: number, mod: number) =>
	((value % mod) + mod) % mod
//((a % n ) + n ) % n
