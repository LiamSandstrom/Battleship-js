export class Player {
  #board;

  constructor(board) {
    this.#board = board;
  }

  getBoard = () => this.#board;
}
