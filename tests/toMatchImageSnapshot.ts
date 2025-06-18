// TODO: Replace with Vitest Visual Regression once implemented: https://github.com/vitest-dev/vitest/pull/8041
import { server } from '@vitest/browser/context'
import { Buffer } from 'buffer'

// @ts-ignore Prevent Vitest exception with buffers
window.Buffer = Buffer

const { readFile, writeFile } = server.commands

// TODO: Avoid "any" here; dont know TypeScript enough to type it properly
export const registerImageSnapshot = (expect: any) => {
	expect.extend({
		// Compare base64 (received) with snapshot path (expected)
		async toMatchImageSnapshot(received: string, expected: string) {
			const { isNot, testPath } = this

			const testDir = testPath.split('/').slice(0, -1).join('/')
			const dir = testDir + '/__snapshots__'
			const path = dir + '/' + expected + '.png'

			let snapshot
			try {
				snapshot = await readFile(path, 'base64')
			} catch (err: unknown) {
				// No such file or directory
				if (err?.toString().includes('ENOENT')) {
					const buffer = [Buffer.from(received, 'base64')]

					// @ts-ignore writeFile has wrong interface, but low-level method accepts buffer
					await writeFile(path, buffer)
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
