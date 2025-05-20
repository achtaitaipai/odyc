import { FilterParams, getFilterSettings } from './shaders/filterSettings'

export class Filter {
	canvas: HTMLCanvasElement
	#settings: ReturnType<typeof getFilterSettings>
	#textureSource: HTMLCanvasElement
	#gl: WebGLRenderingContext
	#program: WebGLProgram
	#texture: WebGLTexture
	#quad: WebGLBuffer
	#uniformCache = new Map<string, WebGLUniformLocation>()
	#attributePositionLocation: GLint

	constructor(target: HTMLCanvasElement, options: FilterParams) {
		this.#settings = getFilterSettings(options)

		this.#textureSource = target
		this.canvas = document.createElement('canvas')
		this.canvas.width = this.#textureSource.width
		this.canvas.height = this.#textureSource.height

		this.canvas.style.setProperty('position', 'absolute')
		this.canvas.style.setProperty('image-rendering', 'crisp-edges')
		this.canvas.style.setProperty('image-rendering', 'pixelated')
		this.canvas.classList.add('odyc-filter-canvas')

		window.addEventListener('resize', this.#setSize)

		const gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true })
		if (!gl) throw new Error('WebGL not supported')
		this.#gl = gl

		const vs = this.#compileShader(
			this.#gl.VERTEX_SHADER,
			this.#settings.vertex,
		)
		const fs = this.#compileShader(
			this.#gl.FRAGMENT_SHADER,
			this.#settings.fragment,
		)
		this.#program = this.#createProgram(vs, fs)
		this.#gl.useProgram(this.#program)

		this.#attributePositionLocation = this.#gl.getAttribLocation(
			this.#program,
			'a_position',
		)

		this.#quad = this.#createQuad()
		this.#texture = this.#createTexture()
		this.#setSize()
		this.#textureSource.after(this.canvas)
		this.#textureSource.style.setProperty('display', 'none')
	}

	#setSize = () => {
		const orientation =
			this.canvas.width < this.canvas.height ? 'vertical' : 'horizontal'
		const sideSize = Math.min(window.innerWidth, window.innerHeight)
		let width =
			orientation === 'horizontal'
				? sideSize
				: (sideSize / this.canvas.height) * this.canvas.width
		let height =
			orientation === 'vertical'
				? sideSize
				: (sideSize / this.canvas.width) * this.canvas.height
		const left = (window.innerWidth - width) * 0.5
		const top = (window.innerHeight - height) * 0.5

		this.canvas.style.setProperty('width', `${width}px`)
		this.canvas.style.setProperty('height', `${height}px`)
		this.canvas.style.setProperty('left', `${left}px`)
		this.canvas.style.setProperty('top', `${top}px`)
		this.render()
	}
	#compileShader(
		type:
			| (typeof WebGLRenderingContext)['FRAGMENT_SHADER']
			| WebGLRenderingContext['VERTEX_SHADER'],
		source: string,
	): WebGLShader {
		const shader = this.#gl.createShader(type)!
		this.#gl.shaderSource(shader, source)
		this.#gl.compileShader(shader)
		if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
			const info = this.#gl.getShaderInfoLog(shader)
			this.#gl.deleteShader(shader)
			throw new Error(`Shader compilation failed:\n${info}`)
		}
		return shader
	}

	#createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
		const program = this.#gl.createProgram()!
		this.#gl.attachShader(program, vs)
		this.#gl.attachShader(program, fs)
		this.#gl.linkProgram(program)
		if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
			const info = this.#gl.getProgramInfoLog(program)
			this.#gl.deleteProgram(program)
			throw new Error(`Program link failed:\n${info}`)
		}
		this.#gl.validateProgram(program)
		if (!this.#gl.getProgramParameter(program, this.#gl.VALIDATE_STATUS))
			throw new Error(
				'validating program' + this.#gl.getProgramInfoLog(program),
			)
		return program
	}

	#createQuad() {
		const verts = new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1])
		const quad = this.#gl.createBuffer()
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, quad)
		this.#gl.bufferData(this.#gl.ARRAY_BUFFER, verts, this.#gl.STATIC_DRAW)
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null)
		if (!quad) throw new Error('failed to create quad')
		return quad
	}

	#createTexture() {
		const texture = this.#gl.createTexture()
		this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture)
		this.#gl.texParameteri(
			this.#gl.TEXTURE_2D,
			this.#gl.TEXTURE_WRAP_S,
			this.#gl.CLAMP_TO_EDGE,
		)
		this.#gl.texParameteri(
			this.#gl.TEXTURE_2D,
			this.#gl.TEXTURE_WRAP_T,
			this.#gl.CLAMP_TO_EDGE,
		)
		this.#gl.texParameteri(
			this.#gl.TEXTURE_2D,
			this.#gl.TEXTURE_MIN_FILTER,
			this.#gl.NEAREST,
		)
		this.#gl.texParameteri(
			this.#gl.TEXTURE_2D,
			this.#gl.TEXTURE_MAG_FILTER,
			this.#gl.NEAREST,
		)
		this.#gl.texImage2D(
			this.#gl.TEXTURE_2D,
			0,
			this.#gl.RGBA,
			this.#gl.RGBA,
			this.#gl.UNSIGNED_BYTE,
			this.#textureSource,
		)
		this.#gl.bindTexture(this.#gl.TEXTURE_2D, null)
		if (!texture) throw new Error('failed to create texture')
		return texture!
	}

	#updateTexture() {
		this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
		this.#gl.texImage2D(
			this.#gl.TEXTURE_2D,
			0,
			this.#gl.RGBA,
			this.#gl.RGBA,
			this.#gl.UNSIGNED_BYTE,
			this.#textureSource,
		)
	}

	#getUniformLocation(name: string) {
		const uniformName = `u_${name}`
		if (this.#uniformCache.has(uniformName))
			return this.#uniformCache.get(uniformName)
		const loc = this.#gl.getUniformLocation(this.#program, uniformName)
		if (loc) this.#uniformCache.set(uniformName, loc)
		return loc
	}

	#setUniform(name: string, values: number | number[]): void {
		const loc = this.#getUniformLocation(name)
		if (!loc) return
		if (typeof values === 'number') values = [values]
		if (values.length < 1 || values.length > 4)
			throw new Error('setUniform supports 1–4 float values')
		switch (values.length) {
			case 1:
				this.#gl.uniform1f(loc, values[0]!)
				break
			case 2:
				this.#gl.uniform2f(loc, values[0]!, values[1]!)
				break
			case 3:
				this.#gl.uniform3f(loc, values[0]!, values[1]!, values[2]!)
				break
			case 4:
				this.#gl.uniform4f(loc, values[0]!, values[1]!, values[2]!, values[3]!)
				break
		}
	}

	render() {
		this.#setUniform('size', [this.canvas.width, this.canvas.height])
		if (this.#settings.settings) {
			Object.entries(this.#settings.settings).forEach(([key, value]) => {
				this.#setUniform(key, value)
			})
		}
		this.#gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		this.#gl.clearColor(0, 0, 0, 1)
		this.#gl.clear(this.#gl.COLOR_BUFFER_BIT)
		this.#updateTexture()
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#quad)
		this.#gl.enableVertexAttribArray(this.#attributePositionLocation)
		this.#gl.vertexAttribPointer(
			this.#attributePositionLocation,
			2,
			this.#gl.FLOAT,
			false,
			0,
			0,
		)
		this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6)
	}
}
export const initFilter = (
	target: HTMLCanvasElement,
	options?: FilterParams,
) => {
	if (!options) return null
	return new Filter(target, options)
}
