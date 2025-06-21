import { expect, it } from 'vitest'
import { createGame, startRecording } from '../../../dist'

it('throws error if createGame is not called', () => {
	expect(() => startRecording()).toThrow(
		'No visible canvas frames found for screenshot',
	)
})

it('returns stop function when recording starts', () => {
	createGame()
	const stopRecording = startRecording()

	expect(stopRecording).toBeDefined()
	expect(typeof stopRecording).toBe('function')
})

it('stop function accepts filename parameter', () => {
	createGame()
	const stopRecording = startRecording()

	expect(() => stopRecording('test-recording')).not.toThrow()
})

it('can start multiple recordings independently', () => {
	createGame()
	const stopRecording1 = startRecording()
	const stopRecording2 = startRecording()

	expect(typeof stopRecording1).toBe('function')
	expect(typeof stopRecording2).toBe('function')
	expect(stopRecording1).not.toBe(stopRecording2)
})

it('stop function can be called without errors', () => {
	createGame()
	const stopRecording = startRecording()

	// Should not throw when stopping and saving
	expect(() => {
		stopRecording('test-filename')
	}).not.toThrow()
})
