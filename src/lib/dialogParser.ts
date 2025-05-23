type TokenType = 'char' | 'color' | 'effect'

type TokenPattern = {
	pattern: string
	type: TokenType
	process?: (m: string) => string
}

type Token = {
	value: string
	type: TokenType
}

const effects = {
	'~': 'waveY',
	_: 'waveX',
	'%': 'shake',
	'=': 'shakeX',
	'^': 'shakeY',
} as const

type EffectSymbol = keyof typeof effects

type Effect = (typeof effects)[EffectSymbol]

export type Char = {
	value: string
	color?: number
	effect?: Effect
}

export function parseDialog(text: string, maxLength: number, separator = '|') {
	const tokens = tokenize(text)
	const chars = solve(tokens)
	return breakLines(chars, maxLength, separator)
}

const tokensPattern: TokenPattern[] = [
	{
		pattern: '\\\\.',
		type: 'char',
		process: (m) => m.charAt(1),
	},
	{
		pattern: '<\\d>',
		type: 'color',
		process: (m: string) => m.charAt(1),
	},
	{
		pattern: Object.keys(effects).map(escapeRegex).join('|'),
		type: 'effect',
		process: (m: string) => effects[m as EffectSymbol],
	},
	{
		pattern: `[^\\n\\r\\t]`,
		type: 'char',
	},
]

const regex = new RegExp(
	tokensPattern.map((t) => `(${t.pattern})`).join('|'),
	'g',
)

function tokenize(str: string): Token[] {
	const matches = str.matchAll(regex)
	const tokens: Token[] = []
	for (const match of matches) {
		match.shift()
		const index = match.findIndex((m) => m !== undefined)
		const { type, process } = tokensPattern[index]!
		const value = process ? process(match[index]!) : match[index]!
		tokens.push({ value, type })
	}
	return tokens
}

function solve(tokens: Token[]): Char[] {
	let chars: Char[] = []
	const colorsQueue: number[] = []
	const effectsQueue: Effect[] = []
	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index]
		if (!token) continue
		const { type, value } = token

		if (type === 'char') {
			const color = colorsQueue[colorsQueue.length - 1]
			const effect = effectsQueue[effectsQueue.length - 1]
			chars.push({
				value,
				color,
				effect,
			})
			continue
		}

		if (token.type === 'color') {
			const index = colorsQueue.lastIndexOf(parseInt(value))
			if (index !== -1) colorsQueue.splice(index, 1)
			else colorsQueue.push(parseInt(value))
			continue
		}

		if (token.type === 'effect') {
			const index = effectsQueue.lastIndexOf(value as Effect)
			if (index !== -1) effectsQueue.splice(index, 1)
			else effectsQueue.push(value as Effect)
		}
	}
	return chars
}

function breakLines(
	chars: Char[],
	maxLength: number,
	separator: string,
): Char[][] {
	const result: Char[][] = []

	while (chars.length > 0) {
		const separatorIndex = chars.findIndex(
			(el, i) => el.value === separator && i < maxLength,
		)
		if (separatorIndex !== -1) {
			result.push(chars.splice(0, separatorIndex))
			chars.splice(0, 1)
			continue
		}

		if (chars.length <= maxLength) {
			result.push(chars)
			chars = []
			continue
		}

		for (let c = maxLength; c--; c >= 0) {
			const char = chars[c]
			if (char?.value === ' ') {
				result.push(chars.splice(0, c))
				chars.splice(0, 1)
				break
			}
		}
	}

	if (chars.length > 0) result.push(chars)
	return result
}

function escapeRegex(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
