import { cordsToIndex, randomInt } from "./helpers/utils.js";

export class Player {
  #board;
  #DomBoard;
  handlerMap;
  #shotMap;

  constructor(board, domBoard) {
    this.#board = board;
    this.#DomBoard = domBoard;
    this.handlerMap = new WeakMap();
    this.#shotMap = new Set();
  }

  getBoard = () => this.#board;
  getBoardSize = () => this.#board.getLength();
  getDomBoard = () => this.#DomBoard;

  shoot(enemyBoard, rowMax) {
    if (this.#shotMap.size >= rowMax * rowMax) return
    let row;
    let col;
      while (true) {
        row = randomInt(0, rowMax - 1);
        col = randomInt(0, rowMax - 1);
        if (this.#shotMap.has(`${row},${col}`) == false) {
          this.#shotMap.add(`${row},${col}`);
          break;
        }
      }

    const index = cordsToIndex([row, col], rowMax);
    const cellRef = enemyBoard.children[index];

    return { cords: [row, col], cell: cellRef };
  }
}
