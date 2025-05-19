import {
	createSoundFromTemplate,
	createSoundFromUrl,
	playSound,
	TEMPLATES as SOUNDTEMPLATES,
	type Sound,
} from 'pfxr'
import { isUrl } from './lib'
export type SoundPlayerParams = {
	volume: number
}

type SoundTemplateKey = keyof typeof SOUNDTEMPLATES

export class SoundPlayer {
	audioContext: AudioContext
	gainNode: GainNode
	playing = false

	constructor(params: SoundPlayerParams) {
		this.audioContext = new AudioContext()
		this.gainNode = this.audioContext.createGain()
		this.gainNode.gain.value = params.volume
		this.gainNode.connect(this.audioContext.destination)
	}

	async play(sound: Partial<Sound>) {
		if (this.playing) return
		this.playing = true

		return playSound(sound, this.audioContext, this.gainNode).then(() => {
			this.playing = false
		})
	}
}

export const initSoundPlayer = (params: SoundPlayerParams) =>
	new SoundPlayer(params)

type CreateSoundParams =
	| [key: SoundTemplateKey]
	| [key: SoundTemplateKey, seed: number]
	| [url: `${'http' | 'https'}://${string}.${string}`]

export const createSound = (...args: CreateSoundParams): Partial<Sound> => {
	const [key, seed] = args
	if (isUrl(key)) return createSoundFromUrl(new URL(key))
	if (key in SOUNDTEMPLATES)
		return createSoundFromTemplate(
			SOUNDTEMPLATES[key as keyof typeof SOUNDTEMPLATES],
			seed,
		)
	return {}
}
