import {
	INPUT_MIN_SWIPE_DIST,
	INPUT_TIME_BETWEEN_KEYS,
	INPUT_TIME_BETWEEN_TOUCH,
} from './consts'
import { createSingleton } from './lib'

export type Input = 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | 'ACTION'

/**
 * Input handler configuration parameters
 */
export type InputsHandlerParams = {
	/** Key bindings for each input action - maps input types to keyboard event codes */
	controls: Record<Input, string | string[]>
}

class InputsHandler {
	controls: [Input, string | string[]][] = []
	lastKeysEvents: Map<string, number> = new Map()
	onInput?: (input: Input) => void
	lastPointerEvent = 0
	oldTouchX?: number
	oldTouchY?: number
	pointerId?: number
	isSliding = false

	static get touchEventElement() {
		return
	}

	constructor() {
		const touchEventElement = document.createElement('div')
		touchEventElement.classList.add('odyc-touchEvent')
		touchEventElement.style.setProperty('position', 'absolute')
		touchEventElement.style.setProperty('left', '0')
		touchEventElement.style.setProperty('height', '0')
		touchEventElement.style.setProperty('width', '100vw')
		touchEventElement.style.setProperty('height', '100vh')
		touchEventElement.style.setProperty('overflow', 'hidden')
		touchEventElement.style.setProperty('touch-action', 'none')
		touchEventElement.style.setProperty('z-index', '999999999')
		document.body.appendChild(touchEventElement)
		document.body.style.setProperty('margin', '0')

		document.addEventListener('keydown', this.handleKeydown)
		touchEventElement.addEventListener('pointerdown', this.handleTouch)
		touchEventElement.addEventListener('pointerup', this.handleTouchUp)
		touchEventElement.addEventListener('pointerleave', this.handleTouchLeave)
		touchEventElement.addEventListener('pointercancel', this.handleTouchLeave)
		touchEventElement.addEventListener('pointermove', this.handleTouchMove)
	}

	init(params: InputsHandlerParams, onInput: (input: Input) => void) {
		this.lastKeysEvents.clear()
		this.lastPointerEvent = 0
		this.oldTouchX = undefined
		this.oldTouchY = undefined
		this.pointerId = undefined
		this.isSliding = false
		this.controls = Object.entries(params.controls) as [
			Input,
			string | string[],
		][]
		this.onInput = onInput
	}

	handleTouch = (e: PointerEvent) => {
		if (e.pointerType === 'mouse') return
		this.pointerId = e.pointerId
		this.oldTouchX = e.clientX
		this.oldTouchY = e.clientY
	}

	handleTouchUp = (e: PointerEvent) => {
		if (this.pointerId !== e.pointerId) return
		this.pointerId = undefined
		if (!this.isSliding) this.onInput?.('ACTION')
		this.isSliding = false
	}

	handleTouchLeave = (e: PointerEvent) => {
		if (this.pointerId !== e.pointerId) return
		this.pointerId = undefined
		this.isSliding = false
	}

	handleTouchMove = (e: PointerEvent) => {
		if (this.pointerId !== e.pointerId) return
		const x = e.clientX
		const y = e.clientY
		if (
			x === undefined ||
			y === undefined ||
			this.oldTouchX === undefined ||
			this.oldTouchY === undefined
		)
			return
		const diffX = x - this.oldTouchX
		const diffY = y - this.oldTouchY
		const now = e.timeStamp

		if (
			Math.abs(diffX) < INPUT_MIN_SWIPE_DIST &&
			Math.abs(diffY) < INPUT_MIN_SWIPE_DIST
		)
			return
		if (now - this.lastPointerEvent < INPUT_TIME_BETWEEN_TOUCH) return

		this.lastPointerEvent = now
		this.oldTouchX = x
		this.oldTouchY = y

		this.isSliding = true
		if (Math.abs(diffY) > Math.abs(diffX)) {
			const direction = Math.sign(diffY)
			this.onInput?.(direction < 0 ? 'UP' : 'DOWN')
		} else {
			const direction = Math.sign(diffX)
			this.onInput?.(direction < 0 ? 'LEFT' : 'RIGHT')
		}
	}

	handleKeydown = (e: KeyboardEvent) => {
		const entrie = this.controls.find(
			([_, keys]) => keys === e.code || keys.includes(e.code),
		)
		if (!entrie) return
		const [input] = entrie
		const now = e.timeStamp
		const last = this.lastKeysEvents.get(e.code)
		if (e.repeat && last && now - last < INPUT_TIME_BETWEEN_KEYS) return
		this.lastKeysEvents.set(e.code, now)
		this.onInput?.(input)
	}
}

const getSingleton = createSingleton(() => new InputsHandler())

export const getInputsHandler = (
	params: InputsHandlerParams,
	onInput: (input: Input) => void,
) => {
	const inputsHandler = getSingleton(null)
	inputsHandler.init(params, onInput)
	return inputsHandler
}
