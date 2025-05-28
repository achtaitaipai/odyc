import defaultVertex from './default.vert.glsl'
import defaultFragment from './default.frag.glsl'
import fractalShader from './fractal.frag.glsl'
import crtShader from './crt.frag.glsl'
import neonShader from './neon.frag.glsl'

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
