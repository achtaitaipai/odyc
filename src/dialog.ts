export class Dialog {
	wrapperElement: HTMLElement
	boxElement: HTMLElement
	lines: [HTMLElement, HTMLElement]
	resolvePromise?: () => void
	text?: string[]
	lineCursor = 0
	currentChunk?: string[]
	isOpen = false

	requestAnimationFrameId?: number
	lastTime = 0
	timeBetweenChar = 50
	charsByLine = 24

	constructor() {
		this.wrapperElement = document.createElement('div')
		this.boxElement = document.createElement('div')
		this.lines = [document.createElement('p'), document.createElement('p')]
		this.boxElement.style.setProperty('display', 'none')
		this.boxElement.classList.add('odyc_dialog')
		this.boxElement.append(...this.lines)
		this.wrapperElement.append(this.boxElement)

		this._resize()
		document.body.append(this.wrapperElement)
		window.addEventListener('resize', this._resize)
	}
	private _resize = () => {
		const sideSize = Math.min(window.innerWidth, window.innerHeight) * 0.9
		const left = (window.innerWidth - sideSize) * 0.5
		const top = (window.innerHeight - sideSize) * 0.5
		this.wrapperElement.style.setProperty('position', 'absolute')
		this.wrapperElement.style.setProperty('box-sizing', 'border-box')
		this.wrapperElement.style.setProperty('width', `${sideSize}px`)
		this.wrapperElement.style.setProperty('height', `${sideSize}px`)
		this.wrapperElement.style.setProperty('left', `${left}px`)
		this.wrapperElement.style.setProperty('top', `${top}px`)
	}

	async open(text: string) {
		this.text = this.chunkText(text, this.charsByLine)
		this.isOpen = true
		this.boxElement.style.removeProperty('display')

		this.currentChunk = this.text.shift()?.split('')

		this.requestAnimationFrameId = requestAnimationFrame(this.update)
		return new Promise<void>((res) => {
			this.resolvePromise = () => res()
		})
	}

	update = (now: number) => {
		requestAnimationFrame(this.update)
		if (now - this.lastTime < this.timeBetweenChar) return
		this.lastTime = now
		if (
			this.currentChunk?.length === 0 &&
			this.lineCursor < this.lines.length - 1
		) {
			this.lineCursor++
			this.currentChunk = this.text?.shift()?.split('')
		}

		const currentLine = this.lines[this.lineCursor]
		const newChar = this.currentChunk?.shift()
		if (currentLine && newChar) currentLine.textContent += newChar
	}

	next() {
		if (!this.isOpen) return
		if (this.currentChunk?.length === 0 || this.currentChunk === undefined) {
			this.currentChunk = this.text?.shift()?.split('')
			if (this.currentChunk === undefined) {
				this.close()
				return
			}
			this.lineCursor++
			if (this.lineCursor >= this.lines.length) {
				this.lineCursor = 0
				this.lines.forEach((l) => (l.textContent = ''))
			}
		}
	}

	close() {
		this.isOpen = false
		this.boxElement.style.setProperty('display', 'none')
		this.resolvePromise?.()
		this.lines.forEach((l) => (l.textContent = ''))
		this.lineCursor = 0
		this.requestAnimationFrameId &&
			cancelAnimationFrame(this.requestAnimationFrameId)
	}

	chunkText(text: string, chunckLength: number) {
		const regex = new RegExp(
			`(.{1,${chunckLength}})( +\|$\\n?)\|(.{1,${chunckLength}})`,
			'gm',
		)
		return Array.from(text.match(regex) ?? [])
	}
}

export const initDialog = () => new Dialog()
