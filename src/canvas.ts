import { createSingleton } from './lib'

type CanvasParams = { id: string; zIndex?: number }

export class Canvas {
	element: HTMLCanvasElement

	constructor({ id, zIndex }: CanvasParams) {
		this.element = document.createElement('canvas')
		this.element.style.setProperty('position', 'absolute')
		this.element.style.setProperty('image-rendering', 'pixelated')
		if (id) this.element.classList.add(id)
		if (zIndex) this.element.style.setProperty('z-index', zIndex.toString())
		document.body.append(this.element)
		window.addEventListener('resize', this.#fitToScreen)
	}

	show() {
		this.element.style.setProperty('display', 'block')
	}

	hide() {
		this.element.style.setProperty('display', 'none')
	}

	setSize(width: number, height: number) {
		this.element.width = width
		this.element.height = height
		this.#fitToScreen()
	}

	get2dCtx() {
		const ctx = this.element.getContext('2d')
		if (!ctx) throw new Error('failled to access context of the canvas')
		return ctx
	}

	getWebglCtx() {
		const ctx = this.element.getContext('webgl', { preserveDrawingBuffer: true })
		if (!ctx) throw new Error('failled to access context of the canvas')
		return ctx
	}

	#fitToScreen = () => {
		const orientation =
			this.element.width < this.element.height ? 'vertical' : 'horizontal'
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		let width =
			orientation === 'horizontal'
				? sideSize
				: (sideSize / this.element.height) * this.element.width
		let height =
			orientation === 'vertical'
				? sideSize
				: (sideSize / this.element.width) * this.element.height
		const left = (window.innerWidth - width) * 0.5
		const top = (window.innerHeight - height) * 0.5
		this.element.style.setProperty('width', `${width}px`)
		this.element.style.setProperty('height', `${height}px`)
		this.element.style.setProperty('left', `${left}px`)
		this.element.style.setProperty('top', `${top}px`)
	}
}

const get = createSingleton((params: CanvasParams) => new Canvas(params))

export const getCanvas = (params: CanvasParams) => get(params.id, params)
