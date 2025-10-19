export class Player {
  #board;
  #DomBoard;
  handlerMap;

  constructor(board, domBoard) {
    this.#board = board;
    this.#DomBoard = domBoard;
    this.handlerMap = new WeakMap();
  }

  getBoard = () => this.#board;
  getBoardSize = () => this.#board.getLength();
  getDomBoard = () => this.#DomBoard;
}
