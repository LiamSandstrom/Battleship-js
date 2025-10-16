import { Ship } from "./Ship";

export function create2dArray(size, initialValue = null) {
  if (size <= 0) throw new Error("Tried to create 2dArray with size <= 0");

  return Array.from({ length: size }, () => Array(size).fill(initialValue));
}

export function inRange([row, col], size) {
  if (row < 0 || row >= size) throw new Error("OUT OF RANGE");
  if (col < 0 || col >= size) throw new Error("OUT OF RANGE");
  return true;
}

export function isValidShip(ship) {
  if (!(ship instanceof Ship)) return false;
  return true;
}

export class GameBoard {
  #gameBoard2dArr;
  #ships = [];

  #cellState = {
    EMPTY: 0,
    MISS: 1,
  };

  constructor(size) {
    this.setNewBoard(size);
  }

  setNewBoard(size) {
    this.#gameBoard2dArr = create2dArray(size, this.#cellState.EMPTY);
  }

  placeShip(cordsArr, ship) {
    if (!isValidShip(ship)) return;
    for (const cords of cordsArr) {
      this.#placeShipAtCell(cords, ship);
    }
    this.#ships.push(ship);
  }

  #placeShipAtCell([row, col], ship) {
    if (!this.#inRange([row, col])) return;
    this.#gameBoard2dArr[row][col] = ship;
  }

  receiveAttack([row, col]) {
    if (!this.#canAttackCords([row, col])) return;

    const cell = this.getCell([row, col]);

    if (cell === this.getCellEmptyEnum()) {
      this.#gameBoard2dArr[row][col] = this.getCellMissEnum();
    }
    //Is valid ship
    else {
      cell.hit([row, col]);
    }
  }

  #canAttackCords([row, col]) {
    const cell = this.getCell([row, col]);
    if (cell === undefined) return false;
    if (cell === this.getCellMissEnum()) return false;
    if (isValidShip(cell) && cell.areCordsHit()) return false;
    return true;
  }

  AllShipsSunken() {
    for (const ship of this.#ships) {
      if (!ship.isSunk()) return false;
    }
    return true;
  }

  getCell([row, col]) {
    if (!this.#inRange([row, col])) return;
    return this.#gameBoard2dArr[row][col];
  }

  getCellEmptyEnum = () => this.#cellState.EMPTY;
  getCellMissEnum = () => this.#cellState.MISS;

  #inRange([row, col]) {
    return inRange([row, col], this.#gameBoard2dArr.length);
  }
}
