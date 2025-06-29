import defaultVertex from './default.vert.glsl'
import defaultFragment from './default.frag.glsl'
import fractalShader from './fractal.frag.glsl'
import crtShader from './crt.frag.glsl'
import neonShader from './neon.frag.glsl'
import glowShader from './glow.frag.glsl'

/**
 * Shader uniform values (scalars, vec2, vec3, vec4)
 */
export type Uniforms = Record<
	string,
	| number
	| [number, number]
	| [number, number, number]
	| [number, number, number, number]
>

type Filter = {
	fragment?: string
	vertex?: string
	settings?: Uniforms
}

const filters = {
	fractal: {
		fragment: fractalShader,
		settings: {
			sideCount: 12,
			scale: 0.9,
			rotation: 0,
		},
	},
	crt: {
		fragment: crtShader,
		settings: {
			warp: 0.7,
			lineIntensity: 0.2,
			lineWidth: 0.6,
			lineCount: 85,
		},
	},
	neon: {
		fragment: neonShader,
		settings: {
			scale: 0.75,
			intensity: 0.8,
		},
	},
	glow: {
		fragment: glowShader,
		settings: {
			intensity: 0.5,
		},
	},
} satisfies Record<string, Filter>

type FilterKey = keyof typeof filters

type FilterSettingsOf<T extends FilterKey> = {
	name: T
	settings?: Partial<(typeof filters)[T]['settings']>
}

type CustomFilterSettings = {
	fragment?: string
	vertex?: string
	settings?: Uniforms
}

/**
 * Visual filter configuration - supports built-in filters or custom shaders.
 *
 * Built-in filters:
 * - 'fractal': Creates a polygon of n sides for each pixel with configurable rotation and scale
 * - 'crt': Simulates old CRT monitor with scanlines and screen curvature
 * - 'neon': Adds glowing neon-like effect with bloom
 * - 'glow': Adds a glowing effect without mosaic
 *
 * @example
 * ```typescript
 * // Built-in filter
 * const fractalFilter = {
 *   name: 'fractal',
 *   settings: {
 *     sideCount: 6, // Hexagon
 *     scale: 0.8,
 *     rotation: 45
 *   }
 * }
 *
 * // Custom shader filter
 * const customFilter = {
 *   fragment: `
 *     precision mediump float;
 *     uniform sampler2D u_texture;
 *     varying vec2 v_texcoord;
 *     void main() {
 *       gl_FragColor = texture2D(u_texture, v_texcoord) * 0.8;
 *     }
 *   `,
 *   settings: { customParam: 1.0 }
 * }
 * ```
 */
export type FilterParams =
	| {
			[K in FilterKey]: FilterSettingsOf<K>
	  }[FilterKey]
	| CustomFilterSettings

export const getFilterSettings = (settings: FilterParams) => {
	if ('name' in settings) {
		const params = Object.assign(
			{},
			filters[settings.name].settings,
			settings.settings,
		)

		return {
			//@ts-ignore
			vertex: filters[settings.name].vertex ?? defaultVertex,
			fragment: filters[settings.name].fragment ?? defaultFragment,
			settings: params,
		}
	}

	return {
		vertex: settings.vertex ?? defaultVertex,
		fragment: settings.fragment ?? defaultFragment,
		settings: settings.settings,
	}
}
