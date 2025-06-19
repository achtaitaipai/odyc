import { Canvas, getCanvas } from './canvas'
import {
	FilterParams,
	getFilterSettings,
	Uniforms,
} from './shaders/filterSettings'

export class Filter {
	canvas: Canvas
	#settings: ReturnType<typeof getFilterSettings>
	#uniforms: Uniforms = {}
	#textureSource: HTMLCanvasElement
	#gl: WebGLRenderingContext
	#program: WebGLProgram
	#texture: WebGLTexture
	#quad: WebGLBuffer
	#uniformCache = new Map<string, WebGLUniformLocation>()
	#attributePositionLocation: GLint

	constructor(target: HTMLCanvasElement, options: FilterParams) {
		this.#settings = getFilterSettings(options)

		if (this.#settings.settings)
			for (const key in this.#settings.settings) {
				const value =
					this.#settings.settings?.[key as keyof FilterParams['settings']]
				this.#uniforms[key] = Array.isArray(value)
					? ([...value] as typeof value)
					: value
			}

		this.#textureSource = target
		this.canvas = getCanvas({ id: 'odyc-filter-canvas' })
		this.canvas.setSize(this.#textureSource.width, this.#textureSource.height)

		const gl = this.canvas.getWebglCtx()
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
		this.#textureSource.style.setProperty('display', 'none')
	}

	render() {
		this.#setUniform('size', [
			this.canvas.element.width,
			this.canvas.element.height,
		])
		if (this.#uniforms) {
			Object.entries(this.#uniforms).forEach(([key, value]) => {
				this.#setUniform(key, value)
			})
		}
		this.#gl.viewport(
			0,
			0,
			this.canvas.element.width,
			this.canvas.element.height,
		)
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

	setUniforms(settings: Uniforms) {
		for (const [name, values] of Object.entries(settings)) {
			this.#uniforms[name] = Array.isArray(values) ? [...values] : values
		}
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
}
export const initFilter = (
	target: HTMLCanvasElement,
	options?: FilterParams,
) => {
	if (!options) return null
	return new Filter(target, options)
}
