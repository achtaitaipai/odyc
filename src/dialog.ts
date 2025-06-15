import { Char, getColorFrompalette, TextFx } from './lib'
import { RendererParams } from './renderer'
import { type Sound } from 'pfxr'
import { SoundPlayer } from './sound.js'

export type DialogParams = {
	dialogBackground: string | number
	dialogColor: string | number
	dialogBorder: string | number
	colors: RendererParams['colors']
	soundPlayer?: SoundPlayer
}

const CANVAS_SIZE = 384
const ANIMATION_INTERVAL_MS = 30
const MAX_LINES = 2
const MAX_CHARS_PER_LINE = 28
const LINE_GAP = 10
const PADDING_X = 8
const PADDING_Y = 12
const FONT_SIZE = 8
const BOX_OUTLINE = 2

export class Dialog {
	#canvas: HTMLCanvasElement
	#ctx: CanvasRenderingContext2D
	#resolvePromise?: () => void

	// All remaining lines to be displayed
	#remainingLines?: Char[][]
	// Queue of characters currently being typed, line by line
	#currentLineQueue?: Char[]

	// Lines currently visible on screen
	#displayedLines: Char[][] = []
	#lineCursor = 0
	#animationId?: number
	#lastFrameTime = 0

	#textFx: TextFx
	#soundPlayer?: SoundPlayer
	#currentVoiceOverride?: { template?: 'BLIP' | 'HIT' | 'PICKUP' | 'JUMP' | 'FALL' | 'POWERUP' | 'LASER' | 'BLIP_RANDOM', seed?: number | null }
	#dialogSeed?: number

	isOpen = false

	#configColors: RendererParams['colors']
	#backgroundColor: string
	#contentColor: string
	#borderColor: string

	#boxHeight: number
	#boxWidth: number
	#boxX: number
	#boxY: number

	constructor(params: DialogParams) {
		this.#configColors = params.colors
		this.#backgroundColor = this.#getColor(params.dialogBackground)
		this.#contentColor = this.#getColor(params.dialogColor)
		this.#borderColor = this.#getColor(params.dialogBorder)
		this.#soundPlayer = params.soundPlayer

		this.#canvas = document.createElement('canvas')
		this.#canvas.style.setProperty('position', 'absolute')
		this.#canvas.style.setProperty('box-sizing', 'border-box')
		this.#canvas.style.setProperty('display', 'none')
		this.#canvas.style.setProperty('image-rendering', 'pixelated')
		this.#ctx = this.#canvas.getContext('2d')!
		this.#canvas.width = CANVAS_SIZE
		this.#canvas.height = CANVAS_SIZE
		this.#canvas.classList.add('odyc-dialog-canvas')

		this.#resizeCanvas()
		document.body.append(this.#canvas)
		window.addEventListener('resize', this.#resizeCanvas)

		this.#boxWidth = MAX_CHARS_PER_LINE * 8 + PADDING_X * 2
		this.#boxHeight =
			MAX_LINES * FONT_SIZE + PADDING_Y * 2 + LINE_GAP * (MAX_LINES - 1)
		this.#boxX = (this.#canvas.width - this.#boxWidth) * 0.5
		this.#boxY =
			this.#canvas.height - this.#boxHeight - Math.floor(CANVAS_SIZE / 15)

		this.#textFx = new TextFx('|', this.#contentColor, params.colors)
	}

	async open(text: string, defaultVoice?: { template?: 'BLIP' | 'HIT' | 'PICKUP' | 'JUMP' | 'FALL' | 'POWERUP' | 'LASER' | 'BLIP_RANDOM', seed?: number | null } | null, voiceOverride?: { template?: 'BLIP' | 'HIT' | 'PICKUP' | 'JUMP' | 'FALL' | 'POWERUP' | 'LASER' | 'BLIP_RANDOM', seed?: number | null }) {
		this.isOpen = true
		this.#canvas.style.setProperty('display', 'block')
		this.#currentVoiceOverride = voiceOverride || defaultVoice || undefined
		this.#dialogSeed = undefined // Reset dialog seed for new dialog

		this.#remainingLines = this.#textFx.parseText(text, MAX_CHARS_PER_LINE)
		this.#currentLineQueue = this.#remainingLines.shift()
		this.#displayedLines = new Array(MAX_LINES).fill(null).map((_) => [])

		this.#animationId = requestAnimationFrame(this.#update)

		return new Promise<void>((res) => {
			this.#resolvePromise = () => res()
		})
	}

	next() {
		// If there are still characters left to type in the current line, do nothing
		if (
			(this.#currentLineQueue && this.#currentLineQueue.length > 0) ||
			this.#lineCursor < MAX_LINES - 1
		)
			return

		// Load the next line from the remaining lines queue
		this.#currentLineQueue = this.#remainingLines?.shift()

		// Reset to a new dialog box (clear lines and restart cursor)
		this.#lineCursor = 0
		this.#displayedLines = this.#displayedLines.map(() => [])

		// If there are no more lines to display, close the dialog
		if (this.#currentLineQueue === undefined) {
			this.#close()
		}
	}

	#update = (time: number) => {
		this.#animationId = requestAnimationFrame(this.#update)
		if (time - this.#lastFrameTime < ANIMATION_INTERVAL_MS) return
		this.#lastFrameTime = time
		if (
			this.#currentLineQueue?.length === 0 &&
			this.#lineCursor < MAX_LINES - 1
		) {
			this.#lineCursor++
			this.#currentLineQueue = this.#remainingLines?.shift()
		}

		let newChar = this.#currentLineQueue?.shift()

		if (newChar) {
			this.#displayedLines[this.#lineCursor]?.push(newChar)
			// Play MIDI-style voice sound for non-space characters - only if voice is explicitly defined
			if (this.#soundPlayer && this.#currentVoiceOverride && this.#currentVoiceOverride.template && newChar.value !== ' ') {
				const template = this.#currentVoiceOverride.template
				const seed = this.#currentVoiceOverride.seed
				
				let finalTemplate = template
				let characterSeed = seed ?? 0
				
				if (template === 'BLIP_RANDOM') {
					// BLIP_RANDOM: new random seed for each character
					finalTemplate = 'BLIP'
					characterSeed = Math.floor(Math.random() * 1000)
				} else if (seed === null) {
					// seed=null: random seed per dialog (not per character)
					characterSeed = this.#dialogSeed ?? (this.#dialogSeed = Math.floor(Math.random() * 1000))
				}
				
				// Play voice sample with appropriate variation
				const velocity = 0.8 + Math.random() * 0.4 // 0.8-1.2 volume variation
				
				// Determine if we should use variation
				let useVariation = false
				if (template === 'BLIP_RANDOM') {
					// BLIP_RANDOM: each character gets random variation
					useVariation = true
				} else if (seed === null) {
					// seed=null: use random variation within template
					useVariation = true
				}
				
				// Play voice sample
				this.#soundPlayer.playVoiceSample(finalTemplate, velocity, useVariation)
			}
		}
		this.#render(time)
	}

	#close() {
		this.isOpen = false
		this.#canvas.style.setProperty('display', 'none')
		this.#lineCursor = 0
		this.#resolvePromise?.()
		this.#animationId && cancelAnimationFrame(this.#animationId)
		
		// No cleanup needed for individual sounds
	}

	#resizeCanvas = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this.#canvas.style.setProperty('width', `${sideSize}px`)
		this.#canvas.style.setProperty('height', `${sideSize}px`)
		this.#canvas.style.setProperty('left', `${left}px`)
		this.#canvas.style.setProperty('top', `${top}px`)
	}

	#render = (time: number) => {
		this.#drawBox()
		const posX = this.#boxX + PADDING_X
		for (let y = 0; y < this.#displayedLines.length; y++) {
			const line = this.#displayedLines[y]
			if (!line) continue
			const posY = this.#boxY + PADDING_Y + 8 * y + y * LINE_GAP
			this.#textFx.draw(this.#ctx, line, posX, posY, time)
		}
	}

	#drawBox() {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#ctx.fillStyle = this.#borderColor
		this.#ctx.fillRect(
			this.#boxX - BOX_OUTLINE,
			this.#boxY - BOX_OUTLINE,
			this.#boxWidth + BOX_OUTLINE * 2,
			this.#boxHeight + BOX_OUTLINE * 2,
		)
		this.#ctx.fillStyle = this.#backgroundColor
		this.#ctx.fillRect(this.#boxX, this.#boxY, this.#boxWidth, this.#boxHeight)
	}

	#getColor(color: string | number) {
		if (typeof color === 'string') return color
		return this.#configColors[color] ?? 'black'
	}
}

export const initDialog = (params: DialogParams) => new Dialog(params)
