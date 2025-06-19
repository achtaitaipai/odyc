import { Dialog } from './dialog.js'
import { Ender } from './ender.js'
import { ActorFacade } from './gameState/actorFacade.js'
import { GameState } from './gameState/index.js'
import { Input } from './inputs.js'
import { addVectors } from './lib/vector.js'
import { PlaySoundArgs, SoundPlayer } from './sound.js'
import { Position } from './types.js'

export type GameLoopParams<T extends string> = {
	soundPlayer: SoundPlayer
	dialog: Dialog
	gameState: GameState<T>
	ender: Ender
}

class GameLoop<T extends string> {
	#gameState: GameState<T>
	#soundPlayer: SoundPlayer
	#dialog: Dialog
	#ender: Ender

	constructor(params: GameLoopParams<T>) {
		this.#gameState = params.gameState
		this.#soundPlayer = params.soundPlayer
		this.#dialog = params.dialog
		this.#ender = params.ender
	}

	async update(input: Input) {
		this.#ender.ending = false

		this.#gameState.player.setDirection(input)

		const from = this.#gameState.player.position
		const to = addVectors(from, directions[input])

		if (this.#isCellOnworld(to)) {
			const actor = this.#gameState.actors.getCell(...to)

			if (!actor.solid) {
				await this.#gameState.actors.getEvent(...from, 'onLeave')?.()
				this.#gameState.player.position = to
			}

			this.#playSound(actor)
			await this.#openDialog(actor)

			if (actor.solid)
				await this.#gameState.actors.getEvent(...to, 'onCollide')?.()
			else await this.#gameState.actors.getEvent(...to, 'onEnter')?.()
		}
		for (const actor of this.#gameState.actors.get()) {
			await this.#gameState.actors.getEvent(...actor.position, 'onTurn')?.()
		}
		this.#gameState.player.dispatchOnTurn()
		if (!this.#ender.ending) this.#gameState.turn.next()
		await this.#end(this.#gameState.actors.getCell(...to))
	}

	#playSound(actor: ActorFacade<T>) {
		const sound = actor.sound
		if (sound) {
			const soundParams: PlaySoundArgs = Array.isArray(sound) ? sound : [sound]
			this.#soundPlayer.play(...soundParams)
		}
	}
	async #openDialog(actor: ActorFacade<T>) {
		if (actor.dialog) await this.#dialog.open(actor.dialog, actor.voice)
	}

	async #end(actor: ActorFacade<T>) {
		const endMessage = actor.end
		if (endMessage) {
			if (typeof endMessage === 'string') await this.#ender.play(endMessage)
			else if (typeof endMessage === 'boolean' && endMessage) this.#ender.play()
			else await this.#ender.play(...endMessage)
		}
	}

	#isCellOnworld([x, y]: Position) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.#gameState.gameMap.dimensions[0] &&
			y < this.#gameState.gameMap.dimensions[1]
		)
	}
}

const directions: Record<Input, Position> = {
	LEFT: [-1, 0],
	RIGHT: [1, 0],
	UP: [0, -1],
	DOWN: [0, 1],
	ACTION: [0, 0],
}

export const initGameLoop = <T extends string>(params: GameLoopParams<T>) =>
	new GameLoop(params)
