let gridsize = 10;
let orientation = '0';
 
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    orientation = orientation === '0' ? '1' : '0';
    updateOrientationDisplay();
  }
});
 
class Ship {
  constructor(shiplength, hitcount = 0, sunk = false, position = []) {
    this.shiplength = shiplength;
    this.hitcount = hitcount;
    this.sunk = sunk;
    this.position = position;
  }
 
  hit() { this.hitcount++; }
 
  isSunk() { return this.hitcount >= this.shiplength; }
}
 
class Gameboard {
  constructor(grid = [], ships = [], missedAttacks = [], hitSquares = []) {
    this.grid = grid;
    this.ships = ships;
    this.missedAttacks = missedAttacks;
    this.hitSquares = hitSquares;
  }
 
  addShip(startLocation, length, shipOrientation) {
    const vessel = new Ship(length);
 
    if (shipOrientation == 1) {
      for (let i = 0; i < length; i++) {
        if (startLocation[1] + length - 1 > gridsize) return "illegal position";
        vessel.position.push([startLocation[0], startLocation[1] + i]);
      }
    }
 
    if (shipOrientation == 0) {
      for (let i = 0; i < length; i++) {
        if (startLocation[0] + length - 1 > gridsize) return "illegal position";
        vessel.position.push([startLocation[0] + i, startLocation[1]]);
      }
    }
 
    this.ships.push(vessel);
    return vessel;
  }
 
  receiveAttack(position) {
    const alreadyAttacked = [...this.missedAttacks, ...this.hitSquares];
    if (alreadyAttacked.some(pos => pos[0] === position[0] && pos[1] === position[1])) {
      return "already attacked";
    }
 
    for (const vessel of this.ships) {
      const hit = vessel.position.some(
        pos => pos[0] === position[0] && pos[1] === position[1]
      );
      if (hit) {
        vessel.hit();
        this.hitSquares.push(position);
        return "hit";
      }
    }
 
    this.missedAttacks.push(position);
    return "miss";
  }
 
  gameEndCheck() {
    if (this.ships.every(vessel => vessel.isSunk())) return "game over";
  }
}
 
const instructions = document.getElementById('instructions');
const orientationDisplay = document.getElementById('orientation-display');
const status = document.getElementById('status');
 
function setInstruction(text) {
  instructions.textContent = text;
}
 
function setStatus(text) {
  status.textContent = text;
}
 
function updateOrientationDisplay() {
  orientationDisplay.textContent = orientation === '0'
    ? 'Orientation: ➡ Horizontal'
    : 'Orientation: ⬇ Vertical';
}
 
function markCell(grid, position, result) {
  const col = String.fromCharCode(64 + position[0]);
  const row = position[1];
  const cell = document.getElementById(`${grid}-${col}${row}`);
  if (result === "hit")  cell.classList.add("hit");
  if (result === "miss") cell.classList.add("miss");
}
 
function markShip(position) {
  const col = String.fromCharCode(64 + position[0]);
  const row = position[1];
  document.getElementById(`home-${col}${row}`).classList.add("ship");
}
 
async function waitForClick() {
  return new Promise(resolve => {
    document.querySelectorAll('.grid div').forEach(cell => {
      cell.addEventListener('click', function handler() {
        document.querySelectorAll('.grid div').forEach(c => c.removeEventListener('click', handler));
        const [, coord] = cell.id.split(/-(?=[A-J])/);
        const col = coord.charCodeAt(0) - 64;
        const row = parseInt(coord.slice(1));
        resolve([col, row]);
      });
    });
  });
}
 
async function playerTurn(enemyWaters) {
  const attackLocation = await waitForClick();
  const result = enemyWaters.receiveAttack(attackLocation);
  if (result === "already attacked") {
    setInstruction("You already attacked there — pick another square!");
    return playerTurn(enemyWaters);
  }
  markCell("enemy", attackLocation, result);
  return result;
}
 
const computerAttacked = [];
 
function computerTurn(homeWaters) {
  let attackLocation;
  do {
    const col = Math.floor(Math.random() * gridsize) + 1;
    const row = Math.floor(Math.random() * gridsize) + 1;
    attackLocation = [col, row];
  } while (computerAttacked.some(pos => pos[0] === attackLocation[0] && pos[1] === attackLocation[1]));
 
  computerAttacked.push(attackLocation);
  const result = homeWaters.receiveAttack(attackLocation);
  markCell("home", attackLocation, result);
  return result;
}
 
async function placeShip(board, length) {
  setInstruction(`Place your ship of length ${length} — Tab to rotate`);
  const startLocation = await waitForClick();
  const vessel = board.addShip(startLocation, length, orientation);
  if (vessel === "illegal position") {
    setInstruction(`Illegal position! Try again — length ${length}`);
    return placeShip(board, length);
  }
  vessel.position.forEach(pos => markShip(pos));
}
 
function checkGameOver(homeWaters, enemyWaters) {
  if (enemyWaters.gameEndCheck() === "game over") return "win";
  if (homeWaters.gameEndCheck() === "game over") return "lose";
  return null;
}
 
function endGame(result) {
  if (result === "win") {
    setStatus('🎉 You win!');
    setInstruction('Game over — refresh to play again');
  } else {
    setStatus('💀 You lose!');
    setInstruction('Game over — refresh to play again');
  }
}
 
async function playGame() {
  let homeWaters = new Gameboard();
  let enemyWaters = new Gameboard();
 
  await placeShip(homeWaters, 5);
  await placeShip(homeWaters, 4);
  await placeShip(homeWaters, 3);
  await placeShip(homeWaters, 3);
  await placeShip(homeWaters, 2);
 
  enemyWaters.addShip([1, 1], 5, 0);
  enemyWaters.addShip([3, 4], 4, 1);
  enemyWaters.addShip([7, 2], 3, 0);
  enemyWaters.addShip([1, 6], 3, 1);
  enemyWaters.addShip([6, 8], 2, 0);
 
  setInstruction('All ships placed — click the enemy grid to attack!');
 
  while (true) {
    setStatus('Your turn — pick a target');
    await playerTurn(enemyWaters);
 
    const afterPlayer = checkGameOver(homeWaters, enemyWaters);
    if (afterPlayer) { endGame(afterPlayer); break; }
 
    setStatus("Computer's turn...");
    computerTurn(homeWaters);
 
    const afterComputer = checkGameOver(homeWaters, enemyWaters);
    if (afterComputer) { endGame(afterComputer); break; }
  }
}
 
playGame();