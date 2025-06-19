import { expect, test } from 'vitest'
import { charToSprite } from '../../../dist'

test('add to cell', async () => {
	'0123456789abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ'
		.split('')
		.forEach((c) => {
			expect(charToSprite(c, '1')).toMatchSnapshot()
		})
})
