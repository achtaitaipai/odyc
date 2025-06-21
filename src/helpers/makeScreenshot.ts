import { Screenshot } from '../lib'

export function makeScreenshot(filename: string) {
	const screenshot = new Screenshot()
	screenshot.save(filename)
}
