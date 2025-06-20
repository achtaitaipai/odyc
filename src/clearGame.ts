import { Dialog } from './dialog'
import { initGameApi } from './gameApi'
import { MessageBox } from './messageBox'
import { Prompt } from './prompt'
import { Renderer } from './renderer'
let currentClearGameMethod: ((color?: number | string) => void) | null = null

export function setClearGame<T extends string>(
	renderer: Renderer,
	dialog: Dialog,
	messageBox: MessageBox,
	prompt: Prompt,
	gameApi: ReturnType<typeof initGameApi<T>>,
) {
	currentClearGameMethod = (color?: number | string) => {
		dialog.close()
		messageBox.close()
		prompt.close()
		renderer.clear(color)
		for (const key in gameApi) delete gameApi[key as keyof typeof gameApi]
	}
}

export function clearPreviousGame(color?: number | string) {
	currentClearGameMethod?.(color)
	currentClearGameMethod = null
}
