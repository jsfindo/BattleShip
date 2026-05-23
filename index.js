let gridsize =10

class Ship{
    constructor(shiplength, hitcount =0, sunk = false, position = []){
        this.shiplength = shiplength
        this.hitcount = hitcount
        this.sunk = sunk
        this.position = position

    }

    hit(){
        this.hitcount++
    }

    
       isSunk() {
            return this.hitcount === this.shiplength}

    
}

class Gameboard{
    constructor(grid = [], ships = [], missedAttacks = []){
        this.grid = grid
        this.ships = ships
        this.missedAttacks = missedAttacks

    }
addShip(startLocation, length, orientation) {
        const vessel = new Ship(length, hitcount =0, sunk = false, position = [])

        if (orientation == 1) {
            for (let i = 0; i < length; i++) {
                if (startLocation[1] + length - 1 > gridsize) {
                    return "illegal position"
                }
                vessel.position.push([startLocation[0], startLocation[1] + i])
            }
        }

        if (orientation == 0) {
            for (let i = 0; i < length; i++) {
                if (startLocation[0] + length - 1 > gridsize) {
                    return "illegal position"
                }
                vessel.position.push([startLocation[0] + i, startLocation[1]])
            }
        }

        this.ships.push(vessel)  // ← fixed
    }

    receiveAttack(position) {
        for (const vessel of this.ships) {
            const hit = vessel.position.some(
                pos => pos[0] === position[0] && pos[1] === position[1]
            )

            if (hit) {
                vessel.hit()
                vessel.isSunk()
                return "hit"
            }
        }

        this.missedAttacks.push(position)
        return "miss"
    }
gameEndCheck() {
    if (this.ships.every(vessel => vessel.isSunk())) {
        return "game over"
    }



}}


class Player{
    constructor(type, board = []){
        this.type = type
        this.board = board
    }

}
export { Ship, Gameboard }
   
