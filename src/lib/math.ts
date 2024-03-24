export const clamp = (min: number, max: number, value: number) =>
	Math.max(min, Math.min(value, max))
