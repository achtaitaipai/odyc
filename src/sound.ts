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

export type PlaySoundArgs =
	| [key: SoundTemplateKey]
	| [key: SoundTemplateKey, seed: number]
	| [url: `${'http' | 'https'}://${string}.${string}`]
	| [sound: Partial<Sound>]

export class SoundPlayer {
	#audioContext: AudioContext
	#gainNode: GainNode
	#voiceGainNode: GainNode
	#playing = false
	#lastVoiceTime = 0
	#voiceSamples: Map<string, AudioBuffer> = new Map()

	constructor(params: SoundPlayerParams) {
		this.#audioContext = new AudioContext()
		this.#gainNode = this.#audioContext.createGain()
		this.#gainNode.gain.value = params.volume
		this.#gainNode.connect(this.#audioContext.destination)
		
		// Separate gain node for voice sounds (independent volume control)
		this.#voiceGainNode = this.#audioContext.createGain()
		this.#voiceGainNode.gain.value = params.volume * 0.8 // Slightly quieter voices
		this.#voiceGainNode.connect(this.#audioContext.destination)
		
		// Pre-generate voice samples
		this.#generateVoiceSamples()
	}

	get audioContext() {
		return this.#audioContext
	}

	async play(...args: PlaySoundArgs) {
		if (this.#playing) return
		this.#playing = true
		const sound = this.#getSound(...args)
		return playSound(sound, this.#audioContext, this.#gainNode).then(() => {
			this.#playing = false
		})
	}

	async playVoice(...args: PlaySoundArgs) {
		// Throttle voice sounds to prevent audio context overload
		const now = Date.now()
		if (now - this.#lastVoiceTime < 15) return // Min 15ms between voice sounds
		this.#lastVoiceTime = now

		// Resume audio context if suspended (browser autoplay policy)
		if (this.#audioContext.state === 'suspended') {
			try {
				await this.#audioContext.resume()
			} catch (error) {
				console.warn('Could not resume audio context:', error)
				return
			}
		}

		try {
			const sound = this.#getSound(...args)
			// Use separate voice gain node - completely independent from main sound system
			return playSound(sound, this.#audioContext, this.#voiceGainNode)
		} catch (error) {
			console.warn('Voice sound failed:', error)
			return Promise.resolve()
		}
	}

	#getSound(...args: PlaySoundArgs) {
		const [key, seed] = args
		if (typeof key !== 'string') return key
		if (isUrl(key)) return createSoundFromUrl(new URL(key))
		if (key in SOUNDTEMPLATES)
			return createSoundFromTemplate(
				SOUNDTEMPLATES[key as keyof typeof SOUNDTEMPLATES],
				seed,
			)
		return {}
	}

	async #generateVoiceSamples() {
		const voiceTemplates = {
			HUMAN: { frequency: 800, waveForm: 0, sustainTime: 0.025, decayTime: 0.003 },
			ROBOT: { frequency: 100, waveForm: 1, sustainTime: 0.028, decayTime: 0.006 },
			GHOST: { frequency: 1200, waveForm: 0, sustainTime: 0.040, decayTime: 0.012 },
			MONSTER: { frequency: 300, waveForm: 1, sustainTime: 0.030, decayTime: 0.015 },
			ALIEN: { frequency: 1000, waveForm: 3, sustainTime: 0.020, decayTime: 0.005 },
			NARRATOR: { frequency: 600, waveForm: 0, sustainTime: 0.035, decayTime: 0.006 }
		}

		for (const [templateName, params] of Object.entries(voiceTemplates)) {
			try {
				// Create base PFXR sound with optimized voice parameters  
				const sound = createSoundFromTemplate(SOUNDTEMPLATES.PICKUP, 42)
				const voiceSound = {
					...sound,
					...params,
					attackTime: 0.001,
					volume: 0.3
				}

				// Generate base audio buffer
				const buffer = await this.#pfxrToAudioBuffer(voiceSound)
				if (buffer) {
					this.#voiceSamples.set(templateName, buffer)
				}

				// Generate variations for random playback (5 variations per template)
				for (let i = 0; i < 5; i++) {
					const variationSound = {
						...voiceSound,
						frequency: params.frequency + (i - 2) * 50, // ±100Hz variation range
					}
					const variationBuffer = await this.#pfxrToAudioBuffer(variationSound)
					if (variationBuffer) {
						this.#voiceSamples.set(`${templateName}_VAR${i}`, variationBuffer)
					}
				}
			} catch (error) {
				console.warn(`Failed to generate voice sample for ${templateName}:`, error)
			}
		}
	}

	async #pfxrToAudioBuffer(sound: Partial<Sound>): Promise<AudioBuffer | null> {
		try {
			// Create a simple synthesized version based on PFXR parameters
			const sampleRate = this.#audioContext.sampleRate
			const duration = 0.05 // 50ms should be enough for voice sounds
			const bufferLength = Math.ceil(duration * sampleRate)
			const buffer = this.#audioContext.createBuffer(1, bufferLength, sampleRate)
			
			const channelData = buffer.getChannelData(0)
			const frequency = sound.frequency ?? 800
			const sustainTime = sound.sustainTime ?? 0.025
			const decayTime = sound.decayTime ?? 0.003
			const waveForm = sound.waveForm ?? 0
			
			for (let i = 0; i < bufferLength; i++) {
				const t = i / sampleRate
				if (t > sustainTime + decayTime) break
				
				// Generate waveform
				let wave = 0
				switch (waveForm) {
					case 0: // Sine
						wave = Math.sin(2 * Math.PI * frequency * t)
						break
					case 1: // Sawtooth
						wave = 2 * ((frequency * t) % 1) - 1
						break
					case 2: // Square
						wave = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
						break
					case 3: // Triangle
						const phase = (frequency * t) % 1
						wave = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase
						break
				}
				
				// Apply envelope
				let envelope = 1
				if (t > sustainTime) {
					const decayProgress = (t - sustainTime) / decayTime
					envelope = Math.max(0, 1 - decayProgress)
				}
				
				channelData[i] = wave * envelope * 0.3
			}
			
			return buffer
		} catch (error) {
			console.warn('Failed to convert PFXR to audio buffer:', error)
			return null
		}
	}

	async playVoiceSample(template: string, velocity: number = 1, useVariation: boolean = false) {
		// Throttle voice sounds to prevent audio context overload
		const now = Date.now()
		if (now - this.#lastVoiceTime < 10) return
		this.#lastVoiceTime = now

		// Resume audio context if suspended
		if (this.#audioContext.state === 'suspended') {
			try {
				await this.#audioContext.resume()
			} catch (error) {
				console.warn('Could not resume audio context:', error)
				return
			}
		}

		try {
			let sampleKey = template
			
			// Use random variation if requested
			if (useVariation) {
				const variationIndex = Math.floor(Math.random() * 5) // 0-4
				const variationKey = `${template}_VAR${variationIndex}`
				if (this.#voiceSamples.has(variationKey)) {
					sampleKey = variationKey
				}
			}

			const sample = this.#voiceSamples.get(sampleKey)
			if (!sample) {
				console.warn(`Voice sample not found: ${sampleKey}`)
				return
			}

			// Create buffer source
			const source = this.#audioContext.createBufferSource()
			source.buffer = sample
			// No pitch shifting - play at original rate
			source.playbackRate.value = 1.0

			// Apply velocity as volume
			const gainNode = this.#audioContext.createGain()
			gainNode.gain.value = velocity * 0.5 // Scale down volume
			
			// Connect: source -> gain -> voice output
			source.connect(gainNode)
			gainNode.connect(this.#voiceGainNode)

			// Play the sound
			source.start()

			return source
		} catch (error) {
			console.warn('Voice sample failed:', error)
			return Promise.resolve()
		}
	}
}

export const initSoundPlayer = (params: SoundPlayerParams) =>
	new SoundPlayer(params)

type CreateSoundArgs =
	| [key: SoundTemplateKey]
	| [key: SoundTemplateKey, seed: number]
	| [url: `${'http' | 'https'}://${string}.${string}`]

/**
 * @deprecated
 */
export const createSound = (...args: CreateSoundArgs): Partial<Sound> => {
	const [key, seed] = args
	if (isUrl(key)) return createSoundFromUrl(new URL(key))
	if (key in SOUNDTEMPLATES)
		return createSoundFromTemplate(
			SOUNDTEMPLATES[key as keyof typeof SOUNDTEMPLATES],
			seed,
		)
	return {}
}
