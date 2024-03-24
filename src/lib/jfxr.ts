//@ts-ignore
import { ALL_PRESETS, Sound } from 'jfxr'
import { Random } from './random.js'

const FxEnum = {
	DEFAULT: 0,
	RANDOM: 1,
	PICKUP: 2,
	LASER: 3,
	EXPLOSION: 4,
	POWERUP: 5,
	HIT: 6,
	JUMP: 7,
	BLIP: 8,
}

export type FxKey = keyof typeof FxEnum

export const createSound = (template: FxKey, seed?: number) => {
	const presetIndex = FxEnum[template]
	const sound = new Sound()
	const pres = ALL_PRESETS[presetIndex]
	const random = new Random(seed)
	pres.random = random
	pres.applyTo(sound)
	return sound.serialize() as string
}
