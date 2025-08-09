import { createGame } from 'odyc'
import { vi } from 'vitest'

const state = {
	turnSpy: null as any,
	enterSpy: null as any,
	collideSpy: null as any,
    onCollideStartSpy: null as any,
}

export const init = () => {
	state.turnSpy = vi.fn()
	state.enterSpy = vi.fn()
	state.collideSpy = vi.fn()
    state.onCollideStartSpy = vi.fn()
	const game = createGame({
		templates: {
			x: {
				sprite: 1,
				solid: true,
				visible: true,
				onTurn: state.turnSpy,
				onEnter: state.enterSpy,
				onCollide: state.collideSpy,
                onCollideStart: state.onCollideStartSpy,
			},
			y: {
				sprite: 2,
				solid: false,
				visible: false,
			},
			z: {
				sprite: 3,
				solid: true,
				dialog: 'test dialog',
			},
		},
		map: `xyz
		     ...
		     ...`,
	})

	return { game, state }
}
