import { addBorderToShip, renderBoard } from "./UI/BoardUI.js";
import { Ship } from "./logic/Ship.js";
import { cordsArrToIndexArr, randomInt } from "./helpers/utils.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";
import { cordsToIndex, indexToCords } from "./helpers/utils.js";

export class Controller {
  #p1;
  #p2;
  #currentPlayer;
  #defaultShips;
  #p2IsAI;
  #boardSize;

  constructor({
    boardSize = 10,
    ships = [5, 4, 3, 3, 2],
    p2IsAI = false,
  } = {}) {
    this.#defaultShips = ships.sort();
    this.#p2IsAI = p2IsAI;
    this.#boardSize = boardSize;

    const board1 = new GameBoard(boardSize);
    const board2 = new GameBoard(boardSize);

    const domBoard1 = document.querySelector("#p1-board");
    const domBoard2 = document.querySelector("#p2-board");

    this.#p1 = new Player(board1, domBoard1);
    this.#p2 = new Player(board2, domBoard2);
    this.#currentPlayer = this.#p1;
  }

  render() {
    const flatArr1 = this.#p1.getBoard().getFlatBoardCopy();
    const flatArr2 = this.#p2.getBoard().getFlatBoardCopy();
    renderBoard(this.#p1.getDomBoard(), flatArr1, this.cellClicked);
    renderBoard(this.#p2.getDomBoard(), flatArr2, this.cellClicked);
    this.setShipBorderAll(this.#p1);
    this.setShipBorderAll(this.#p2);
  }

  initialShipSpawn() {
    for (const shipSize of this.#defaultShips) {
      this.#spawnShip(shipSize, this.#p1);
    }

    for (const shipSize of this.#defaultShips) {
      this.#spawnShip(shipSize, this.#p2);
    }
  }

  #spawnShip(shipSize, player) {
    const board = player.getBoard();
    const maxIndex = board.getLength() - 1;

    let cords = [];
    let vertical = Math.random() < 0.5;

    for (let tries = 0; tries < 100; tries++) {
      cords = [];
      const row = randomInt(0, vertical ? maxIndex - shipSize : maxIndex);
      const col = randomInt(0, vertical ? maxIndex : maxIndex - shipSize);

      for (let i = 0; i < shipSize; i++) {
        const r = vertical ? row + i : row;
        const c = vertical ? col : col + i;
        const cell = board.getCell([r, c]);
        if (cell.isShip()) break;
        cords.push([r, c]);
      }

      if (cords.length === shipSize) break;
    }

    if (cords.length !== shipSize)
      throw new Error("Cannot place ship: board is too crowded");

    const ship = new Ship(shipSize);
    board.placeShip(cords, ship);
  }

  setShipBorderAll(player, ship) {
    const ships = player.getBoard().getShips();
    const domBoard = player.getDomBoard();

    for (const [ship, cords] of ships) {
      const index = cordsArrToIndexArr(cords, this.#boardSize);
      addBorderToShip(domBoard, index);
    }
  }

  setShipBorder(player, ship) {
    const shipCords = player.getBoard().getShips().get(ship);
    const domBoard = player.getDomBoard();
    addBorderToShip(domBoard, shipCords);
  }

  cellClicked = ([row, col], cell) => {
    if (this.#currentPlayer.getDomBoard() != cell.parentElement) return;

    this.#currentPlayer.getBoard().receiveAttack([row, col]);
    this.#flipTurn();

    this.render();
  };

  #flipTurn() {
    if (this.#currentPlayer === this.#p1) this.#currentPlayer = this.#p2;
    else this.#currentPlayer = this.#p1;
  }
}

//TODO:

//TODO:
//add drag and drop
//calc size of a cell.
//get Width & height methods on ship
//create fake div of this size
//blur real ship while dragging
//move ship method on GameBoard
//move real ship on valid drop


//LOW PRIO:
//fix so hit ship does not have small board border