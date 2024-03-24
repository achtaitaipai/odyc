import { Store } from '../lib/store.js'
import { compareVectors } from '../lib/vector.js'
import { ActorState, Position } from '../types.js'

export type ActorProxy = ReturnType<typeof createActorProxy>

export const createActorProxy = (
	position: Position,
	store: Store<ActorState[]>,
) => {
	let actorsValues: ActorState[] = []

	store.subscribe((values) => (actorsValues = values))

	const getActor = () =>
		actorsValues.find((el) => compareVectors(el.position, position))

	const setActor = <T extends keyof ActorState>(
		key: T,
		value: ActorState[T],
	) => {
		store.update((currentStore) => {
			for (let index = 0; index < currentStore.length; index++) {
				const actor = currentStore[index]
				if (
					!actor ||
					currentStore[index] === undefined ||
					!compareVectors(actor.position, position)
				)
					continue
				currentStore[index]![key] = value
			}
			return currentStore
		})
	}
	const remove = () => {
		store.update((currentStore) =>
			currentStore.filter((el) => !compareVectors(el.position, position)),
		)
	}
	return {
		get sprite() {
			return getActor()?.sprite ?? null
		},
		set sprite(value: ActorState['sprite']) {
			setActor('sprite', value)
		},
		get solid() {
			return getActor()?.solid ?? false
		},
		set solid(value: ActorState['solid']) {
			setActor('solid', value)
		},
		get sound() {
			return getActor()?.sound ?? null
		},
		set sound(value: ActorState['sound']) {
			setActor('sound', value)
		},
		get position() {
			return getActor()?.position ?? [-1, -1]
		},
		get dialog() {
			return getActor()?.dialog ?? null
		},
		set dialog(value: ActorState['dialog']) {
			setActor('dialog', value)
		},
		get visible() {
			return getActor()?.visible ?? false
		},
		set visible(value: ActorState['visible']) {
			setActor('visible', value)
		},
		get end() {
			return getActor()?.end ?? null
		},
		set end(value: ActorState['end']) {
			setActor('end', value)
		},
		get symbol() {
			return getActor()?.symbol ?? ''
		},
		remove,
	}
}
