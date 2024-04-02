export class MessageBox {
	wrapperElement: HTMLElement
	isOpen = false
	resolePromise?: () => void

	constructor() {
		this.wrapperElement = document.createElement('div')
		this.wrapperElement.classList.add('odyc_messageBox')
		this.wrapperElement.style.setProperty('display', 'none')

		this._resize()
		window.addEventListener('resize', this._resize)

		document.body.append(this.wrapperElement)
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

	open(text: string) {
		this.isOpen = true
		if (!text) return
		this.wrapperElement.style.removeProperty('display')
		const p = document.createElement('p')
		p.textContent = text
		this.wrapperElement.append(p)
		return new Promise<void>((res) => (this.resolePromise = () => res()))
	}

	close = () => {
		this.isOpen = false
		this.wrapperElement.style.setProperty('display', 'none')
		this.wrapperElement.innerHTML = ''
		this.resolePromise?.()
	}
}

export const initMessageBox = () => new MessageBox()
