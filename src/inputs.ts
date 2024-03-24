const TIMEBETWEENKEYS = 200
const TIMEBETWEENTOUCH = 200
const MINSWIPEDIST = 4

export type Input = 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | 'ACTION'

export type InputsHandlerParams = {
	controls: Record<Input, string | string[]>
	autoFocus?: boolean
}

class InputsHandler {
	wrapper: HTMLElement
	controls: [Input, string | string[]][]
	lastKeysEvents: Map<string, number> = new Map()
	onInput: (input: Input) => void
	lastTouchEvent = 0
	oldTouchX?: number
	oldTouchY?: number
	isTouching = false

	constructor(
		params: InputsHandlerParams,
		wrapper: HTMLElement,
		onInput: (input: Input) => void,
	) {
		this.controls = Object.entries(params.controls) as [
			Input,
			string | string[],
		][]
		this.onInput = onInput
		this.wrapper = wrapper
		if (params.autoFocus) this.wrapper.focus()
		this.wrapper.addEventListener('keydown', this.handleKeydown)
		this.wrapper.addEventListener('touchstart', this.handleTouch)
		this.wrapper.addEventListener('touchend', this.handleTouchLeave)
		this.wrapper.addEventListener('touchcancel', this.handleTouchLeave)
		this.wrapper.addEventListener('touchmove', this.handleTouchMove)
	}

	handleTouch = (e: TouchEvent) => {
		if (!this.isTouching) this.onInput('ACTION')
		this.isTouching = true
		this.oldTouchX = e.changedTouches[0]?.clientX
		this.oldTouchY = e.changedTouches[0]?.clientY
	}

	handleTouchLeave = () => {
		this.isTouching = false
	}

	handleTouchMove = (e: TouchEvent) => {
		const x = e.changedTouches[0]?.clientX
		const y = e.changedTouches[0]?.clientY
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

		if (Math.abs(diffX) < MINSWIPEDIST && Math.abs(diffY) < MINSWIPEDIST) return
		if (now - this.lastTouchEvent < TIMEBETWEENTOUCH) return

		this.lastTouchEvent = now
		this.oldTouchX = x
		this.oldTouchY = y

		if (Math.abs(diffY) > Math.abs(diffX)) {
			const direction = Math.sign(diffY)
			this.onInput(direction < 0 ? 'UP' : 'DOWN')
		} else {
			const direction = Math.sign(diffX)
			this.onInput(direction < 0 ? 'LEFT' : 'RIGHT')
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
		if (e.repeat && last && now - last < TIMEBETWEENKEYS) return
		this.lastKeysEvents.set(e.code, now)
		this.onInput(input)
	}
}

export const initInputsHandler = (
	params: InputsHandlerParams,
	wrapper: HTMLElement,
	onInput: (input: Input) => void,
) => new InputsHandler(params, wrapper, onInput)
