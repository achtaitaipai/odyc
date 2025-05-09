export type Tile = string | number

export type Position = [number, number]

export type Unwrap<T> = {
	[K in keyof T]: T[K]
} & {}
