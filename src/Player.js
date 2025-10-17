export class Player {
  #board;
  #DomBoard;

  constructor(board, domBoard) {
    this.#board = board;
    this.#DomBoard = domBoard;
  }

  getBoard = () => this.#board;
  getBoardSize = () => this.#board.getLength();
  getDomBoard = () => this.#DomBoard;
}
