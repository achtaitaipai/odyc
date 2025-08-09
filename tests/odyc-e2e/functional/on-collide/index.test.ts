import { expect, test, describe, vi } from 'vitest'
import { createGame } from 'odyc'
import { userEvent } from '@vitest/browser/context'

describe('onCollide and onCollideStart events', () => {
    test('should call onCollide when player collides with a cell', async () => {
        const collideSpy = vi.fn()
        const game = createGame({
            player: {
                position: [0, 1],
            },
            templates: {
                x: {
                    onCollide: collideSpy,
                },
            },
            map: 
            `
                x.
                ..
            `,
        })
        expect(collideSpy).not.toHaveBeenCalled()
        await userEvent.keyboard('[ArrowUp]')
        expect(collideSpy).toHaveBeenCalled()
    })
    test('should call onCollideStart when player collides with a cell for the first time', async () => {
        const collideStartSpy = vi.fn()
        const game = createGame({
            templates: {
                x: {
                    onCollideStart: collideStartSpy,
                },
            },
            map: 
            `
                x.
                ..
            `,
        })
        expect(collideStartSpy).not.toHaveBeenCalled()
        // slightly more complex route for funsies
        await userEvent.keyboard('[ArrowRight]')
        await userEvent.keyboard('[ArrowUp]')
        await userEvent.keyboard('[ArrowLeft]')
        expect(collideStartSpy).toHaveBeenCalled()
    }) 
})
