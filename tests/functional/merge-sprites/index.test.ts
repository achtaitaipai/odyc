import { expect, test, describe } from 'vitest'
import { mergeSprites } from '../../../dist'

describe('mergeSprites', () => {
	test('returns single sprite unchanged', () => {
		const sprite = '012\n345\n567'
		expect(mergeSprites(sprite)).toBe(sprite)
	})

	test('returns empty string for no arguments', () => {
		expect(mergeSprites()).toBe('')
	})

	test('skips empty string arguments', () => {
		const sprite = '012\n345\n567'
		expect(mergeSprites('', sprite, '')).toBe(sprite)
		expect(mergeSprites('', '', '')).toBe('')
	})

	test('layers sprites with transparency', () => {
		const base = '000\n000\n000'
		const overlay = '.1.\n1.1\n..1'
		const expected = '010\n101\n001'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})

	test('handles different sized sprites - overlay smaller', () => {
		const base = '0000\n0000\n0000\n0000'
		const overlay = '.1\n1.'
		const expected = '0100\n1000\n0000\n0000'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})
	test('handles different sized sprites - overlay larger', () => {
		const base = '00\n00'
		const overlay = '.1..\n1\n..2'
		const expected = '01..\n10..\n..2.'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})
	test('handles multiple layers', () => {
		const base = '000\n000\n000'
		const layer1 = '.1.\n...\n.1.'
		const layer2 = '...\n.2.\n...'
		const expected = '010\n020\n010'
		expect(mergeSprites(base, layer1, layer2)).toBe(expected)
	})
	test('later layers override earlier layers', () => {
		const layer1 = '111\n111\n111'
		const layer2 = '222\n2.2\n222'
		const expected = '222\n212\n222'
		expect(mergeSprites(layer1, layer2)).toBe(expected)
	})
	test('handles mixed empty and valid sprites', () => {
		const sprite1 = '01\n23'
		const sprite2 = '..\n.4'
		const expected = '01\n24'
		expect(mergeSprites('', sprite1, '', sprite2, '')).toBe(expected)
	})
	test('handles sprites with different line lengths', () => {
		const base = '000\n00\n0'
		const overlay = '.1\n.\n..2'
		const expected = '010\n00.\n0.2'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})
	test('handles sprites with leading/trailing newlines', () => {
		const base = '\n000\n000\n'
		const overlay = '.1.\n...'
		const expected = '010\n000'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})
	test('handles all alphanumeric color indices', () => {
		const base = '0123456789'
		const overlay = 'abcdefghij'
		expect(mergeSprites(base, overlay)).toBe(overlay)
	})
	test('handles uppercase color indices', () => {
		const base = 'ABCD'
		const overlay = '.E.F'
		const expected = 'AECF'
		expect(mergeSprites(base, overlay)).toBe(expected)
	})
})
