import { Screenshot } from '../lib'

export function makeScreenshot() {
	const screenshot = new Screenshot()
	return {
		save: screenshot.save,
		get dataUrl() {
			return screenshot.dataUrl
		},
	}
}
