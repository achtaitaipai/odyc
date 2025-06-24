import { Screenshot } from '../lib'

const TIME_BETWEEN_FRAMES = 1000 / 30

class GameRecorder {
	#mediaRecorder: MediaRecorder
	#chunks: Blob[] = []
	#animationFrameId?: number
	#lastFrame: number = 0
	#mimeType: string
	#screenshot: Screenshot

	constructor() {
		this.#mimeType =
			[
				'video/webm',
				'video/webm,codecs=vp9',
				'video/vp8',
				'video/webm;codecs=vp8',
				'video/webm;codecs=daala',
				'video/webm;codecs=h264',
				'video/mpeg',
			].find((el) => MediaRecorder.isTypeSupported(el)) ?? ''

		this.#screenshot = new Screenshot()

		const stream = this.#screenshot.canvas.captureStream(TIME_BETWEEN_FRAMES)
		this.#mediaRecorder = new MediaRecorder(stream, {
			mimeType: this.#mimeType,
		})

		this.#mediaRecorder.ondataavailable = (e) => {
			this.#chunks.push(e.data)
		}
	}

	start() {
		this.#chunks = []
		this.#mediaRecorder.start(100)
		this.#animationFrameId = requestAnimationFrame(this.#loop)
	}

	stop() {
		if (this.#animationFrameId) cancelAnimationFrame(this.#animationFrameId)
		this.#mediaRecorder.stop()
	}

	save(filename: string) {
		const blob = new Blob(this.#chunks, { type: this.#mimeType })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.style.display = 'none'
		link.href = url
		link.download = filename + '.webm'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	#loop = (now: number) => {
		if (now - this.#lastFrame > TIME_BETWEEN_FRAMES) {
			this.#screenshot.update()
			this.#lastFrame = now
		}
		this.#animationFrameId = requestAnimationFrame(this.#loop)
	}
}

export function startRecording() {
	const gameRecorder = new GameRecorder()
	gameRecorder.start()

	return (filename: string) => {
		gameRecorder.stop()
		gameRecorder.save(filename)
	}
}
