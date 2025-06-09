import { Store } from '../lib/store.js'
import { compareVectors } from '../lib/vector.js'
import { Position } from '../types.js'
import { ActorState } from './types.js'

export type Actor = ReturnType<typeof createActorProxy>

export const createActorProxy = <T extends string>(
	position: Position,
	store: Store<ActorState<T>[]>,
) => {
	let actorsValues: ActorState<T>[] = []

	store.subscribe((values) => (actorsValues = values))

	const getActor = () =>
		actorsValues.find((el) => compareVectors(el.position, position))

	const setActor = <U extends keyof ActorState<T>>(
		key: U,
		value: ActorState<T>[U],
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
		set sprite(value: ActorState<T>['sprite']) {
			setActor('sprite', value)
		},
		get solid() {
			return getActor()?.solid ?? false
		},
		set solid(value: ActorState<T>['solid']) {
			setActor('solid', value)
		},
		get sound() {
			return getActor()?.sound ?? null
		},
		set sound(value: ActorState<T>['sound']) {
			setActor('sound', value)
		},
		get position() {
			return getActor()?.position ?? [-1, -1]
		},
		get dialog() {
			return getActor()?.dialog ?? null
		},
		set dialog(value: ActorState<T>['dialog']) {
			setActor('dialog', value)
		},
		get visible() {
			return getActor()?.visible ?? false
		},
		set visible(value: ActorState<T>['visible']) {
			setActor('visible', value)
		},
		get end() {
			return getActor()?.end ?? null
		},
		set end(value: ActorState<T>['end']) {
			setActor('end', value)
		},
		get symbol() {
			return (getActor()?.symbol as T) ?? null
		},
		remove,
	}
}
