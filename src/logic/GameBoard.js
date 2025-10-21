import { Ship } from "./Ship.js";

export function create2dArray(size, valueFactory = () => null) {
  if (size <= 0) throw new Error("Tried to create 2dArray with size <= 0");
  const factory =
    typeof valueFactory === "function" ? valueFactory : () => valueFactory;
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => factory())
  );
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

export class Cell {
  #value;
  #isHit = false;
  constructor(val = null) {
    this.#value = val;
  }

  hit() {
    if (this.#isHit) return false;
    this.#isHit = true;
    if (!isValidShip(this.#value)) return false;
    this.#value.hit();
    return true;
  }

  set value(val) {
    this.#value = val;
  }

  isShip() {
    return isValidShip(this.#value);
  }

  get value() {
    return this.#value;
  }

  isHit() {
    return this.#isHit;
  }
}

export class GameBoard {
  #gameBoard2dArr;
  #ships = new Map();

  constructor(size) {
    this.setNewBoard(size);
  }

  setNewBoard(size) {
    this.#gameBoard2dArr = create2dArray(size, () => new Cell());
  }

  placeShip(cordsArr, ship) {
    if (!isValidShip(ship)) return;
    for (const cords of cordsArr) {
      this.#placeShipAtCell(cords, ship);
    }
    this.#ships.set(ship, cordsArr);
  }

  #placeShipAtCell([row, col], ship) {
    this.getCell([row, col]).value = ship;
  }

  moveShip(cordsArr, ship) {
    if (!isValidShip(ship)) return;

    this.#removeShip(ship);
    this.placeShip(cordsArr, ship);
  }

  #removeShip(ship) {
    const shipCords = this.getShipCords(ship);
    for (const cord of shipCords) {
      const cell = this.getCell(cord);
      cell.value = null;
    }
  }

  receiveAttack([row, col]) {
    const cell = this.getCell([row, col]);
    if (!(cell instanceof Cell)) {
      console.error("Not a Cell:", cell);
      throw new Error("Cell is invalid");
    }
    return cell.hit();
  }

  allShipsSunk() {
    for (const ship of this.#ships.keys()) {
      if (!ship.isSunk()) return false;
    }
    return true;
  }

  getShips = () => this.#ships;

  getCell([row, col]) {
    if (!this.#inRange([row, col])) return;
    return this.#gameBoard2dArr[row][col];
  }

  getFlatBoardCopy() {
    const flat = [];
    for (const row of this.#gameBoard2dArr) {
      for (const cell of row) {
        flat.push({
          isHit: cell.isHit(),
          isShip: cell.isShip(),
          isSunk: cell.isShip() ? cell.value.isSunk() : false,
        });
      }
    }
    return flat;
  }

  getLength = () => this.#gameBoard2dArr.length;

  #inRange([row, col]) {
    return inRange([row, col], this.#gameBoard2dArr.length);
  }

  getShipCords(ship) {
    return this.#ships.get(ship);
  }

  getAllShipCords() {
    const res = [];

    for (const val of this.#ships.values()) {
      res.push(val);
    }
    return res.flat();
  }
}
