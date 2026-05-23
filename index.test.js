import { Ship, Gameboard } from './index'

// ── Ship ──────────────────────────────────────────────────────

describe('Ship', () => {

    describe('constructor', () => {
        test('creates a ship with the correct length', () => {
            const s = new Ship(4)
            expect(s.shiplength).toBe(4)
        })

        test('starts with 0 hits', () => {
            const s = new Ship(3)
            expect(s.hitcount).toBe(0)
        })

        test('starts not sunk', () => {
            const s = new Ship(3)
            expect(s.sunk).toBe(false)
        })

        test('starts with an empty position array', () => {
            const s = new Ship(3)
            expect(s.position).toEqual([])
        })
    })

    describe('hit()', () => {
        test('increments hitcount by 1', () => {
            const s = new Ship(3)
            s.hit()
            expect(s.hitcount).toBe(1)
        })

        test('can be called multiple times', () => {
            const s = new Ship(3)
            s.hit()
            s.hit()
            expect(s.hitcount).toBe(2)
        })
    })

    describe('isSunk()', () => {
        test('returns false when not fully hit', () => {
            const s = new Ship(3)
            s.hit()
            expect(s.isSunk()).toBe(false)
        })

        test('returns true when hits equal ship length', () => {
            const s = new Ship(2)
            s.hit()
            s.hit()
            expect(s.isSunk()).toBe(true)
        })

        test('returns false one hit before sinking', () => {
            const s = new Ship(4)
            s.hit(); s.hit(); s.hit()
            expect(s.isSunk()).toBe(false)
            s.hit()
            expect(s.isSunk()).toBe(true)
        })
    })
})


// ── Gameboard ─────────────────────────────────────────────────

describe('Gameboard', () => {

    describe('addShip()', () => {
        test('adds a horizontal ship with correct positions', () => {
            const board = new Gameboard()
            board.addShip([2, 3], 3, 1)
            expect(board.ships).toHaveLength(1)
            expect(board.ships[0].position).toEqual([[2,3],[2,4],[2,5]])
        })

        test('adds a vertical ship with correct positions', () => {
            const board = new Gameboard()
            board.addShip([1, 5], 3, 0)
            expect(board.ships[0].position).toEqual([[1,5],[2,5],[3,5]])
        })

        test('can add multiple ships', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 2, 1)
            board.addShip([5, 5], 3, 0)
            expect(board.ships).toHaveLength(2)
        })

        test('rejects a horizontal ship that goes out of bounds', () => {
            const board = new Gameboard()
            expect(board.addShip([0, 8], 4, 1)).toBe("illegal position")
        })

        test('rejects a vertical ship that goes out of bounds', () => {
            const board = new Gameboard()
            expect(board.addShip([8, 0], 4, 0)).toBe("illegal position")
        })

        test('does not add an out-of-bounds ship to the ships array', () => {
            const board = new Gameboard()
            board.addShip([0, 8], 4, 1)
            expect(board.ships).toHaveLength(0)
        })

        test('allows ship placed exactly at the grid boundary', () => {
            const board = new Gameboard()
            board.addShip([0, 7], 3, 1)   // cols 7, 8, 9 — valid
            expect(board.ships).toHaveLength(1)
        })
    })

    describe('receiveAttack()', () => {
        test('returns "hit" when attack lands on a ship', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 3, 1)
            expect(board.receiveAttack([0, 1])).toBe("hit")
        })

        test('returns "miss" when attack lands on empty water', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 3, 1)
            expect(board.receiveAttack([5, 5])).toBe("miss")
        })

        test('increments hitcount on the ship that was hit', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 3, 1)
            board.receiveAttack([0, 0])
            expect(board.ships[0].hitcount).toBe(1)
        })

        test('records missed attacks', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 3, 1)
            board.receiveAttack([9, 9])
            expect(board.missedAttacks).toContainEqual([9, 9])
        })

        test('does not add hits to missedAttacks', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 3, 1)
            board.receiveAttack([0, 0])
            expect(board.missedAttacks).toHaveLength(0)
        })

        test('sinks a ship after all positions are hit', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 2, 1)
            board.receiveAttack([0, 0])
            board.receiveAttack([0, 1])
            expect(board.ships[0].isSunk()).toBe(true)
        })

        test('hits the correct ship when multiple ships exist', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 2, 1)   // ship 0
            board.addShip([5, 5], 2, 1)   // ship 1
            board.receiveAttack([5, 5])
            expect(board.ships[0].hitcount).toBe(0)
            expect(board.ships[1].hitcount).toBe(1)
        })
    })

    describe('gameEndCheck()', () => {
        test('returns undefined while ships are still afloat', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 2, 1)
            expect(board.gameEndCheck()).toBeUndefined()
        })

        test('returns "game over" when all ships are sunk', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 2, 1)
            board.receiveAttack([0, 0])
            board.receiveAttack([0, 1])
            expect(board.gameEndCheck()).toBe("game over")
        })

        test('does not return "game over" if only some ships are sunk', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 1, 1)   // will be sunk
            board.addShip([5, 5], 2, 1)   // still alive
            board.receiveAttack([0, 0])
            expect(board.gameEndCheck()).toBeUndefined()
        })

        test('returns "game over" when all of multiple ships are sunk', () => {
            const board = new Gameboard()
            board.addShip([0, 0], 1, 1)
            board.addShip([5, 5], 2, 1)
            board.receiveAttack([0, 0])
            board.receiveAttack([5, 5])
            board.receiveAttack([5, 6])
            expect(board.gameEndCheck()).toBe("game over")
        })
    })
})