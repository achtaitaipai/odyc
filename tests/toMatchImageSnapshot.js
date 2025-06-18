// TODO: Replace with Vitest Visual Regression once implemented: https://github.com/vitest-dev/vitest/pull/8041
import { server } from '@vitest/browser/context'
import { Buffer } from 'buffer'

const { readFile, writeFile } = server.commands

export const registerImageSnapshot = (expect) => {
	expect.extend({
		// Compare base64 (received) with snapshot path (expected)
		async toMatchImageSnapshot(received, expected) {
			const { isNot } = this

			const dir = '__snapshots__'
			const path = dir + '/' + expected + '.png'

			let snapshot
			try {
				snapshot = await readFile(path, 'base64')
			} catch (err) {
				// No such file or directory
				if (err.toString().includes('ENOENT')) {
					const buffer = Buffer.from(received, 'base64')
					await writeFile(path, [buffer])
					return {
						pass: true,
					}
				}
			}

			return {
				pass: isNot ? received !== snapshot : received === snapshot,
				message: () =>
					`Screenshot does${isNot ? ' not' : ''} match ${expected}.png file`,
			}
		},
	})
}
