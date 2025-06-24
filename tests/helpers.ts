import { server } from '@vitest/browser/context'
import { Buffer } from 'buffer'
import { expect } from 'vitest'

// @ts-ignore Prevent Vitest exception with buffers
window.Buffer = Buffer

const { readFile, writeFile } = server.commands

// TODO: Replace with Vitest Visual Regression once implemented: https://github.com/vitest-dev/vitest/pull/8041
// TODO: Avoid "any" here; dont know TypeScript enough to type it properly
export const registerImageSnapshot = (expect: any) => {
	expect.extend({
		// Compare base64 (received) with snapshot path (expected)
		async toMatchImageSnapshot(received: string, expected: string) {
			const { isNot, testPath, currentTestName } = this

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

			const pass = isNot ? received !== snapshot : received === snapshot

			if (!pass) {
				const buffer = [Buffer.from(received, 'base64')]

				const escapedTestName = currentTestName.replace(/[^a-zA-Z0-9]/g, '-')

				await writeFile(
					'.github/snapshots/' + escapedTestName + '-' + expected + '.png',
					// @ts-ignore writeFile has wrong interface, but low-level method accepts buffer
					buffer,
				)
			}

			return {
				pass,
				message: () =>
					`Screenshot does${isNot ? ' not' : ''} match ${expected}.png file`,
			}
		},
	})
}

const DEFAULT_TIMEOUT = 3000 // ms
const DEFAULT_SLEEP = 250 // ms
export const assertEventuelly = async (
	condition: () => void | Promise<void>,
	timeout = DEFAULT_TIMEOUT,
	sleep = DEFAULT_SLEEP,
) => {
	const timeStart = Date.now()
	let lastError: any | undefined

	do {
		await new Promise((resolve) => setTimeout(resolve, sleep))

		try {
			await condition()
			return
		} catch (err: any) {
			lastError = err
		}
	} while (Date.now() - timeStart < timeout)

	expect(lastError, lastError?.message ?? lastError?.toString()).toBeUndefined()
}
