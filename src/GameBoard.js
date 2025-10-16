import { Ship } from "./Ship";

export function create2dArray(size, initialValue = null) {
  if (size <= 0) throw new Error("Tried to create 2dArray with size <= 0");

  return Array.from({ length: size }, () => Array(size).fill(initialValue));
}

export function inRange([row, col], size) {
  if (row < 0 || row >= size) return false;
  if (col < 0 || col >= size) return false;
  return true;
}

export function isValidShip(ship) {
  if (!(ship instanceof Ship)) return false;
  return true;
}

export class GameBoard {
  #gameBoard2dArr;

  constructor(size) {
    this.setNewBoard(size);
  }

  setNewBoard(size) {
    this.#gameBoard2dArr = create2dArray(size);
  }

  placeShipVertical([row, col], ship) {
    if (!isValidShip(ship)) return;
    const endCol = col + ship.length;

    for (let currCol = col; currCol < endCol; currCol++) {
      this.#placeShip([row, currCol], ship);
    }
  }

  placeShipHorizontal([row, col], ship) {
    if (!isValidShip(ship)) return;
    const endRow = row + ship.length;

    for (let currRow = row; currRow < endRow; currRow++) {
      this.#placeShip([currRow, col], ship);
    }
  }

  #placeShip([row, col], ship) {
    if (!inRange([row, col], this.#gameBoard2dArr.length)) return;
    this.#gameBoard2dArr[row][col] = ship;
  }

  getCell([row, col]) {
    if (!inRange([row, col], this.#gameBoard2dArr.length)) return;
    return this.#gameBoard2dArr[row][col];
  }
}
