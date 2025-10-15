export function create2dArray(size, initialValue = null) {
  if (size <= 0) throw new Error("Tried to create 2dArray with size <= 0");

  const arr = Array(size).fill(Array(size).fill(initialValue));
  return arr;
}

export class GameBoard {
  #gameBoard2dArr;

  constructor(size) {
    this.#gameBoard2dArr = this.createBoard(size);
  }

  createBoard(size) {
    this.#gameBoard2dArr = create2dArray(size);
  }
}
