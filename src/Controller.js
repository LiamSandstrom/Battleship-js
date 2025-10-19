import {
  addBorderToShip,
  addCbToCells,
  removeCbFromCells,
  renderBoard,
} from "./UI/BoardUI.js";
import { Ship } from "./logic/Ship.js";
import {
  cordsArrToIndexArr,
  getShipSize,
  indexArrToCordsArr,
  isVertical,
  randomInt,
} from "./helpers/utils.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";
import { cordsToIndex, indexToCords } from "./helpers/utils.js";

const GameState = Object.freeze({
  BEFORE_PLAY: "before_play",
  PLAY: "play",
  AFTER_PLAY: "after_play",
});

export class Controller {
  #p1;
  #p2;
  #currentPlayer;
  #defaultShips;
  #p2IsAI;
  #boardSize;
  #state;
  #copyCells = [];

  constructor({
    boardSize = 10,
    ships = [5, 4, 3, 3, 2],
    p2IsAI = false,
  } = {}) {
    this.#defaultShips = ships.sort();
    this.#p2IsAI = p2IsAI;
    this.#boardSize = boardSize;

    this.#state = GameState.BEFORE_PLAY;

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
    renderBoard(this.#p1.getDomBoard(), flatArr1);
    renderBoard(this.#p2.getDomBoard(), flatArr2);

    switch (this.#state) {
      case GameState.BEFORE_PLAY:
        this.#addCbToBothPlayerCells(this.beforePlayCellClicked, "mousedown");
        break;

      case GameState.PLAY:
        this.#addCbToBothPlayerCells(this.cellClicked, "mousedown");
        break;

      case GameState.AFTER_PLAY:
        break;

      default:
        throw new Error("THIS STATE IS NOT IMPLEMENTED!");
    }

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

  #addCbToCells(cb, event, player) {
    const div = player.getDomBoard();
    addCbToCells(cb, event, player, div);
  }

  #removeCbFromCells(event, player) {
    const div = player.getDomBoard();
    removeCbFromCells(event, player, div);
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

  #addCbToBothPlayerCells(cb, event) {
    this.#addCbToCells(cb, event, this.#p1);
    this.#addCbToCells(cb, event, this.#p2);
  }

  #getCellSize(board) {
    const cell = board.children[0];
    return cell.getBoundingClientRect().width;
  }

  #getIndexOffsets(anchor) {
    const board = this.#currentPlayer.getBoard();
    const ship = board.getCell(anchor).value;
    const shipCords = board.getShipCords(ship);
    const offsets = cordsToOffsets(anchor, shipCords);
    const indexOffsets = cordsArrToIndexArr(offsets, this.#boardSize);
    return indexOffsets;
  }

  beforePlayCellClicked = ([row, col], cell) => {
    const domBoard = this.#currentPlayer.getDomBoard();
    if (domBoard != cell.parentElement) return;
    if (!this.#currentPlayer.getBoard().getCell([row, col]).isShip()) return;

    const anchor = [row, col];
    const indexOffsets = this.#getIndexOffsets(anchor);
    const anchorIndex = cordsToIndex(anchor, this.#boardSize);
    const indexClassMap = getIndexToClassMap(
      anchorIndex,
      indexOffsets,
      domBoard
    );

    this.#makeOutline(anchor, indexClassMap, domBoard);

    this.#addCbToCells(
      (cords, cell) => this.#makeOutline(cords, indexClassMap, domBoard),
      "mouseenter",
      this.#currentPlayer
    );

    document.addEventListener("mouseup", () => {
      this.#removeCbFromCells("mouseenter", this.#currentPlayer);
      this.#removeOutline();
    });
  };

  #makeOutline(currCords, indexClassMap, domBoard) {
    const currIndex = cordsToIndex(currCords, this.#boardSize);
    const targetIndices = [];
    let isValid = true;

    const values = [];
    for (const val of indexClassMap.keys()) {
      values.push(val + currIndex);
    }

    const vertical = isVertical(indexArrToCordsArr(values, this.#boardSize));
    const directionVal = vertical
      ? currIndex % this.#boardSize
      : Math.floor(currIndex / this.#boardSize);

    for (const [offset] of indexClassMap) {
      const targetIndex = currIndex + offset;

      if (targetIndex < 0 || targetIndex >= domBoard.children.length) {
        return;
      }

      const TargetDirectionVal = vertical
        ? targetIndex % this.#boardSize
        : Math.floor(targetIndex / this.#boardSize);

      if (directionVal != TargetDirectionVal) return;

      const targetCell = domBoard.children[targetIndex];
      const innerCell = targetCell.children[0];
      if (
        innerCell &&
        (innerCell.classList.contains("ship-cell") ||
          innerCell.classList.contains("ship-cell-hit"))
      ) {
        isValid = false;
      }
      targetIndices.push(targetIndex);
    }

    this.#removeOutline();

    for (let i = 0; i < targetIndices.length; i++) {
      const index = targetIndices[i];
      const classList = [...indexClassMap.values()][i];
      const cell = domBoard.children[index];
      const newCell = document.createElement("div");
      newCell.className = isValid ? classList : classList + " cant-place";
      cell.appendChild(newCell);
      this.#copyCells.push(cell);
    }
  }

  #removeOutline() {
    for (const cell of this.#copyCells) {
      const cellCopy = cell.children[1];
      if (cellCopy) cell.removeChild(cellCopy);
    }
    this.#copyCells = [];
  }
}

function getIndexToClassMap(anchor, offsets, domBoard) {
  const map = new Map();

  const cl = domBoard.children[anchor].children[0].className + " copy";
  map.set(0, cl);

  for (const offset of offsets) {
    const cl =
      domBoard.children[anchor + offset].children[0].className + " copy";
    map.set(offset, cl);
  }

  return map;
}

function cordsToOffsets(anchor, cords) {
  const offsets = [];

  for (const cord of cords) {
    const x = cord[0] - anchor[0];
    const y = cord[1] - anchor[1];

    offsets.push([x, y]);
  }
  return offsets;
}

//LOW PRIO:
//fix so hit ship does not have small board border
