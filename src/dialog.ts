export class Dialog {
	private _wrapperElement: HTMLElement
	private boxElement: HTMLElement
	private _lines: [HTMLElement, HTMLElement]
	private _resolvePromise?: () => void
	private _text?: string[]
	private _lineCursor = 0
	private _currentChunk?: string[]
	private _requestAnimationFrameId?: number
	private _lastTime = 0
	private _timeBetweenChar = 50
	private _charsByLine = 24

	isOpen = false

	constructor() {
		this._wrapperElement = document.createElement('div')
		this.boxElement = document.createElement('div')
		this._lines = [document.createElement('p'), document.createElement('p')]
		this.boxElement.style.setProperty('display', 'none')
		this.boxElement.classList.add('odyc_dialog')
		this.boxElement.append(...this._lines)
		this._wrapperElement.append(this.boxElement)

		this._resize()
		document.body.append(this._wrapperElement)
		window.addEventListener('resize', this._resize)
	}

	async open(text: string) {
		this._text = this._chunkText(text, this._charsByLine)
		this.isOpen = true
		this.boxElement.style.removeProperty('display')

		this._currentChunk = this._text.shift()?.split('')

		this._requestAnimationFrameId = requestAnimationFrame(this._update)
		return new Promise<void>((res) => {
			this._resolvePromise = () => res()
		})
	}

	next() {
		if (!this.isOpen) return
		if (this._currentChunk?.length === 0 || this._currentChunk === undefined) {
			this._currentChunk = this._text?.shift()?.split('')
			if (this._currentChunk === undefined) {
				this._close()
				return
			}
			this._lineCursor++
			if (this._lineCursor >= this._lines.length) {
				this._lineCursor = 0
				this._lines.forEach((l) => (l.textContent = ''))
			}
		}
	}

	private _update = (now: number) => {
		requestAnimationFrame(this._update)
		if (now - this._lastTime < this._timeBetweenChar) return
		this._lastTime = now
		if (
			this._currentChunk?.length === 0 &&
			this._lineCursor < this._lines.length - 1
		) {
			this._lineCursor++
			this._currentChunk = this._text?.shift()?.split('')
		}

		const currentLine = this._lines[this._lineCursor]
		const newChar = this._currentChunk?.shift()
		if (currentLine && newChar) currentLine.textContent += newChar
	}

	private _resize = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight) * 0.9
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this._wrapperElement.style.setProperty('position', 'absolute')
		this._wrapperElement.style.setProperty('box-sizing', 'border-box')
		this._wrapperElement.style.setProperty('width', `${sideSize}px`)
		this._wrapperElement.style.setProperty('height', `${sideSize}px`)
		this._wrapperElement.style.setProperty('left', `${left}px`)
		this._wrapperElement.style.setProperty('top', `${top}px`)
	}

	private _close() {
		this.isOpen = false
		this.boxElement.style.setProperty('display', 'none')
		this._resolvePromise?.()
		this._lines.forEach((l) => (l.textContent = ''))
		this._lineCursor = 0
		this._requestAnimationFrameId &&
			cancelAnimationFrame(this._requestAnimationFrameId)
	}

	private _chunkText(text: string, chunckLength: number) {
		const regex = new RegExp(
			`(.{1,${chunckLength}})( +\|$\\n?)\|(.{1,${chunckLength}})`,
			'gm',
		)
		return Array.from(text.match(regex) ?? [])
	}
}

export const initDialog = () => new Dialog()
