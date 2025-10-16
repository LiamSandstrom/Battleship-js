import { renderBoard } from "./UI/BoardUI.js";
import { Ship } from "./logic/Ship.js";

const domBoard1 = document.querySelector("#p1-board");
const domBoard2 = document.querySelector("#p2-board");

export class Controller {
  #p1;
  #p2;

  constructor(p1, p2) {
    this.#p1 = p1;
    this.#p2 = p2;
  }

  init() {

    this.#p1.getBoard().placeShip(
      [
        [4, 4],
        [4, 5],
        [4, 6],
      ],
      new Ship(3)
    );
    this.#p1.getBoard().receiveAttack([4, 5]);
    const flatArr1 = this.#p1.getBoard().getFlatBoardCopy();
    const flatArr2 = this.#p2.getBoard().getFlatBoardCopy();
    renderBoard(domBoard1, flatArr1, this.cellClicked);
    renderBoard(domBoard2, flatArr2, this.cellClicked);
  }

  cellClicked([row, col], cell) {
    console.log(row, col);
  }
}
