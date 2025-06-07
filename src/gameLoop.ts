import { Dialog } from './dialog.js'
import { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { ActorState } from './gameState/types.js'
import { Input } from './inputs.js'
import { addVectors, compareVectors } from './lib/vector.js'
import { PlaySoundArgs, SoundPlayer } from './sound.js'
import { Position } from './types.js'

export type GameLoopParams<T extends string> = {
	soundPlayer: SoundPlayer
	dialog: Dialog
	gameState: GameState<T>
	ender: Ender
}

class GameLoop<T extends string> {
	gameState: GameState<T>
	soundPlayer: SoundPlayer
	dialog: Dialog
	ender: Ender

	constructor(params: GameLoopParams<T>) {
		this.gameState = params.gameState
		this.soundPlayer = params.soundPlayer
		this.dialog = params.dialog
		this.ender = params.ender
	}

	async update(input: Input) {
		const currentCell = this.gameState.player.playerProxy.position
		const nextCell = addVectors(currentCell, directions[input])
		if (!this.isCellOnScreen(nextCell)) return
		const actorOnCurrentCell = this.gameState.actors.getCell(...currentCell)
		const actorOnNextCell = this.gameState.actors.getCell(...nextCell)
		const sound = actorOnNextCell.sound
		if (sound) {
			const soundParams: PlaySoundArgs = Array.isArray(sound) ? sound : [sound]
			this.soundPlayer.play(...soundParams)
		}

		const endMessage = actorOnNextCell.end

		if (actorOnNextCell.solid) {
			const colliderDialog = actorOnNextCell.dialog
			if (colliderDialog) await this.dialog.open(colliderDialog)
			await actorOnNextCell.onCollide?.(actorOnNextCell)
		} else {
			actorOnCurrentCell?.onLeave?.(actorOnCurrentCell)
			//move the player if the position is not changed
			if (
				compareVectors(currentCell, this.gameState.player.playerProxy.position)
			)
				this.gameState.player.playerProxy.position = nextCell

			if (actorOnNextCell) {
				const enterDialog = actorOnNextCell?.dialog
				if (enterDialog)
					this.dialog.open(enterDialog).then(() => {
						actorOnNextCell.onEnter?.(actorOnNextCell)
					})
				else {
					actorOnNextCell.onEnter?.(actorOnNextCell)
				}
			}
		}
		if (endMessage) {
			if (typeof endMessage === 'string') await this.ender.play(endMessage)
			else if (typeof endMessage === 'boolean' && endMessage) this.ender.play()
			else await this.ender.play(...endMessage)
		}
	}

	isCellOnScreen([x, y]: Position) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.gameState.mapStore.getDimensions()[0] &&
			y < this.gameState.mapStore.getDimensions()[1]
		)
	}

	getActorOnCell(actors: ActorState<T>[], cellPosition: Position) {
		return actors.find(
			({ position }) =>
				position[0] === cellPosition[0] && position[1] === cellPosition[1],
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
