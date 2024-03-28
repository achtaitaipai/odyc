import { Dialog } from './dialog.js'
import { Ender } from './ender.js'
import { GameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { Input } from './inputs.js'
import { addVectors, compareVectors } from './lib/vector.js'
import { SoundPlayer } from './soundPlayer.js'
import { ActorState, Position } from './types.js'

export type GameLoopParams = {
	soundPlayer: SoundPlayer
	dialog: Dialog
	gameState: GameState<Templates>
	ender: Ender
}

class GameLoop {
	gameState: GameState<Templates>
	soundPlayer: SoundPlayer
	dialog: Dialog
	ender: Ender

	constructor(params: GameLoopParams) {
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
		if (sound) this.soundPlayer.play(sound)

		const endMessage = actorOnNextCell.end

		if (actorOnNextCell.solid) {
			const colliderDialog = actorOnNextCell.dialog
			if (colliderDialog) await this.dialog.open(colliderDialog)
			const symbol = actorOnNextCell.symbol
			await this.gameState.actors._eventsListeners
				.get(actorOnNextCell.symbol ?? '')
				?.onCollide?.(actorOnNextCell)
		} else {
			if (actorOnCurrentCell) {
				const symbol = actorOnCurrentCell.symbol
				this.gameState.actors._eventsListeners
					.get(actorOnCurrentCell.symbol ?? '')
					?.onLeave?.(actorOnCurrentCell)
			}
			if (actorOnNextCell) {
				const enterDialog = actorOnNextCell?.dialog
				const symbol = actorOnNextCell.symbol
				if (enterDialog)
					this.dialog.open(enterDialog).then(() => {
						this.gameState.actors._eventsListeners
							.get(actorOnNextCell.symbol ?? '')
							?.onEnter?.(actorOnNextCell)
					})
				else {
					this.gameState.actors._eventsListeners
						.get(actorOnNextCell.symbol ?? '')
						?.onEnter?.(actorOnNextCell)
				}
			}
			//move the player if the position is not changed
			if (
				compareVectors(currentCell, this.gameState.player.playerProxy.position)
			)
				this.gameState.player.playerProxy.position = nextCell
		}
		if (endMessage) {
			await this.ender.play(endMessage)
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

	getActorOnCell(actors: ActorState[], cellPosition: Position) {
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
	RESTART: [0, 0],
}

export const initGameLoop = (params: GameLoopParams) => new GameLoop(params)
