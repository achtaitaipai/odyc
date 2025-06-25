import { createGame } from 'odyc'
import { play } from './game'

const intro = createGame()
await intro.openMessage('~Vroom~')
play(0)
