export type WrapperParams = {
	container?: HTMLElement
}

export const initWrapper = (params: WrapperParams) => {
	const wrapper = document.createElement('div')
	wrapper.classList.add('odyc_wrapper')
	const defineSize = () => {
		const width = params.container
			? params.container.clientWidth
			: window.innerWidth
		const height = params.container
			? params.container.clientHeight
			: window.innerHeight
		const sideSize = Math.min(width * 0.9, height * 0.9)
		wrapper.style.setProperty('--side-size', `${sideSize}px`)
		wrapper.setAttribute('tabindex', '0')
	}
	const container = params.container ?? document.body
	container.append(wrapper)
	window.addEventListener('resize', defineSize)
	defineSize()
	return wrapper
}
