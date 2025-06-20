import { Position } from '../types'

type Vec2Like = [Vec2] | [Position] | Position
class Vec2 {
	x: number
	y: number
	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	#vec2LikeToVec2(...args: Vec2Like) {
		const [first] = args
		if (first instanceof Vec2) return first
		return vec2(...(args as [Position] | Position))
	}

	get value() {
		return [this.x, this.y]
	}

	set value(value: Position) {
		this.x = value[0]
		this.y = value[1]
	}

	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	get direction() {
		return new Vec2(Math.sign(this.x), Math.sign(this.y))
	}

	add(...args: Vec2Like) {
		const vec = this.#vec2LikeToVec2(...args)
		return new Vec2(this.x + vec.x, this.y + vec.y)
	}

	sub(...args: Vec2Like) {
		const vec = this.#vec2LikeToVec2(...args)
		return new Vec2(this.x - vec.x, this.y - vec.y)
	}

	multiply(value: number) {
		return new Vec2(this.x * value, this.y * value)
	}

	divide(value: number) {
		return new Vec2(this.x / value, this.y / value)
	}

	distance(...args: Vec2Like) {
		const vec = this.#vec2LikeToVec2(...args)
		return vec.sub(this).length
	}

	equals(...args: Vec2Like) {
		const vec = this.#vec2LikeToVec2(...args)
		return vec.x === this.x && vec.y === this.y
	}
}

type Vec2Args = [Position] | Position

export function vec2(...args: Vec2Args) {
	const [first, second] = args
	if (typeof first === 'number') return new Vec2(first, second as number)
	return new Vec2(...first)
}
