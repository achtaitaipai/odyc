export class MessageBox {
	private _wrapperElement: HTMLElement
	isOpen = false
	private _resolePromise?: () => void

	constructor() {
		this._wrapperElement = document.createElement('div')
		this._wrapperElement.classList.add('odyc_messageBox')
		this._wrapperElement.style.setProperty('display', 'none')

		this._resize()
		window.addEventListener('resize', this._resize)

		document.body.append(this._wrapperElement)
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

	open(text: string) {
		this.isOpen = true
		if (!text) return
		this._wrapperElement.style.removeProperty('display')
		const p = document.createElement('p')
		p.textContent = text
		this._wrapperElement.append(p)
		return new Promise<void>((res) => (this._resolePromise = () => res()))
	}

	close = () => {
		this.isOpen = false
		this._wrapperElement.style.setProperty('display', 'none')
		this._wrapperElement.innerHTML = ''
		this._resolePromise?.()
	}
}

export const initMessageBox = () => new MessageBox()
