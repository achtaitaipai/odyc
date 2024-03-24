export class MessageBox {
	wrapperElement: HTMLElement
	isOpen = false
	resolePromise?: () => void

	constructor(wrapper: HTMLElement) {
		this.wrapperElement = document.createElement('div')
		this.wrapperElement.classList.add('odyc_messageBox')
		this.wrapperElement.style.setProperty('display', 'none')
		wrapper.append(this.wrapperElement)
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

export const initMessageBox = (wrapper: HTMLElement) => new MessageBox(wrapper)
