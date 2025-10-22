import {
  addBorderToShip,
  addCbToCells,
  removeCbFromCells,
  removeShipAtIndexes,
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
  #currentHover = null;

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

    // document.addEventListener("keydown", (e) => {
    //   if (e.key.toLowerCase() !== "z") return;
    //   this.#currentPlayer =
    //     this.#currentPlayer === this.#p1 ? this.#p2 : this.#p1;
    //   this.render();
    // });

    // document.addEventListener("keydown", (e) => {
    //   if (e.key.toLowerCase() !== "x") return;
    //   this.#state = GameState.PLAY;
    //   this.#currentPlayer = this.#p1;
    //   this.render();
    // });

    const div = document.querySelector("#buttons");
    const swapButton = document.createElement("button");
    if (!this.#p2IsAI) {
      swapButton.textContent = "Swap player";
      swapButton.addEventListener("click", () => {
        this.#currentPlayer =
          this.#currentPlayer === this.#p1 ? this.#p2 : this.#p1;
        this.render();
      });

      div.appendChild(swapButton);
    }

    const startButton = document.createElement("button");

    startButton.textContent = "Start";
    startButton.addEventListener("click", () => {
      this.#state = GameState.PLAY;
      this.#currentPlayer = this.#p1;
      this.render();
      div.removeChild(startButton);
      if (!this.#p2IsAI) div.removeChild(swapButton);
    });

    div.appendChild(startButton);
  }

  render() {
    const flatArr1 = this.#p1.getBoard().getFlatBoardCopy();
    const flatArr2 = this.#p2.getBoard().getFlatBoardCopy();

    switch (this.#state) {
      case GameState.BEFORE_PLAY:
        if (this.#currentPlayer === this.#p1) {
          renderBoard(this.#p1.getDomBoard(), flatArr1, true);
          renderBoard(this.#p2.getDomBoard(), flatArr2);
          this.setShipBorderAll(this.#p1);
        } else {
          renderBoard(this.#p1.getDomBoard(), flatArr1);
          renderBoard(this.#p2.getDomBoard(), flatArr2, true);
          this.setShipBorderAll(this.#p2);
        }
        this.#addCbToBothPlayerCells(this.beforePlayCellClicked, "mousedown");
        break;

      case GameState.PLAY:
        this.#addBorder();
        if (this.#p2IsAI) {
          renderBoard(this.#p1.getDomBoard(), flatArr1, true);
          renderBoard(this.#p2.getDomBoard(), flatArr2);
          this.setShipBorderAll(this.#p1);
          if (this.#currentPlayer == this.#p2) {
            const shotObj = this.#p2.shoot(
              this.#p1.getDomBoard(),
              this.#boardSize
            );
            if (shotObj != undefined)
              setTimeout(
                () => this.cellClicked(shotObj.cords, shotObj.cell),
                1000
              );
          } else {
            this.#addCbToCells(this.cellClicked, "mousedown", this.#p2);
          }
        } else {
          renderBoard(this.#p1.getDomBoard(), flatArr1);
          renderBoard(this.#p2.getDomBoard(), flatArr2);
          this.#addCbToBothPlayerCells(this.cellClicked, "mousedown");
        }
        this.setShipBorderSunkShips();
        break;

      case GameState.AFTER_PLAY:
        break;

      default:
        throw new Error("THIS STATE IS NOT IMPLEMENTED!");
    }
  }

  #addBorder() {
    let curr;
    let enemy;
    if (this.#currentPlayer == this.#p1) {
      curr = this.#p2;
      enemy = this.#p1;
    } else {
      curr = this.#p1;
      enemy = this.#p2;
    }

    enemy.getDomBoard().classList.remove("curr-board");
    curr.getDomBoard().classList.add("curr-board");
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

    for (let tries = 0; tries < 10000; tries++) {
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

  setShipBorderSunkShips() {
    this.#setShipBorderSunkPlayer(this.#p1);
    this.#setShipBorderSunkPlayer(this.#p2);
  }

  #setShipBorderSunkPlayer(player) {
    const ships = player.getBoard().getShips();
    const domBoard = player.getDomBoard();

    for (const [ship, cords] of ships) {
      if (!ship.isSunk()) continue;
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
    if (this.#state === GameState.AFTER_PLAY) return;
    if (this.#currentPlayer.getDomBoard() == cell.parentElement) return;
    const enemy = this.#currentPlayer === this.#p1 ? this.#p2 : this.#p1;

    let hit = true;
    if (!enemy.getBoard().receiveAttack([row, col])) {
      hit = false;
      this.#flipTurn();
    }

    this.render();
    const index = cordsToIndex([row, col], this.#boardSize);
    if (hit) {
      enemy
        .getDomBoard()
        .children[index].children[0].classList.add("ship-hit-anim");
    } else {
      enemy
        .getDomBoard()
        .children[index].children[0].classList.add("miss-anim");
    }
    if (enemy.getBoard().allShipsSunk()) {
      if (this.#state === GameState.AFTER_PLAY) return;
      const player = this.#currentPlayer === this.#p1 ? "p1" : "p2";
      this.#state = GameState.AFTER_PLAY;
      alert(`${player} Won!`);
    }
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
    const board = this.#currentPlayer.getBoard();
    if (!board.getCell([row, col]).isShip()) return;

    const anchor = [row, col];
    const ship = board.getCell(anchor).value;
    const shipCords = board.getShipCords(ship);
    const indexesToSkip = cordsArrToIndexArr(shipCords, this.#boardSize);
    const indexOffsets = this.#getIndexOffsets(anchor);
    const anchorIndex = cordsToIndex(anchor, this.#boardSize);
    let indexClassMap = getIndexToClassMap(indexOffsets, anchorIndex, domBoard);
    let targetIndexes = null;
    let temp = null;

    temp = this.#makeOutline(
      anchor,
      indexClassMap,
      domBoard,
      indexesToSkip,
      board
    );
    targetIndexes = temp.val == null ? targetIndexes : temp;

    removeShipAtIndexes(indexesToSkip, domBoard);

    const keyHandler = (e) => {
      if (e.key.toLowerCase() !== "r") return;
      const ref = this.#currentHover ?? anchor;
      indexClassMap = this.#rotateIndexClassMap(indexClassMap);
      temp = this.#makeOutline(
        ref,
        indexClassMap,
        domBoard,
        indexesToSkip,
        board
      );
      targetIndexes = temp.val == null ? targetIndexes : temp;
    };
    document.addEventListener("keydown", keyHandler);

    this.#addCbToCells(
      (cords, cell) => {
        this.#currentHover = cords;
        temp = this.#makeOutline(
          cords,
          indexClassMap,
          domBoard,
          indexesToSkip,
          board
        );
        targetIndexes = temp.val == null ? targetIndexes : temp;
      },
      "mouseenter",
      this.#currentPlayer
    );

    document.addEventListener(
      "mouseup",
      () => {
        this.#removeCbFromCells("mouseenter", this.#currentPlayer);
        this.#removeOutline();
        document.removeEventListener("keydown", keyHandler);

        if (!targetIndexes.valid) {
          this.render();
          return;
        }

        const board = this.#currentPlayer.getBoard();
        const ship = board.getCell(anchor).value;
        const res = [];
        for (const index of targetIndexes.val) {
          res.push(indexToCords(index, this.#boardSize));
        }
        console.log(res);
        board.moveShip(
          res.sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0];
            return a[1] - b[1];
          }),
          ship
        );
        setTimeout(() => {
          this.render();
        }, 10);
      },
      { once: true }
    );
  };

  #rotateIndexClassMap(indexClassMap) {
    const map = new Map();

    let i = 0;
    let startVal;
    for (const [index, cssClass] of indexClassMap) {
      const vertical = cssClass.includes("ver") ? true : false;
      let className = cssClass
        .split(" ")
        .filter((cls) => !cls.includes("hor") && !cls.includes("ver"))
        .join(" ");

      if (i === 0) {
        startVal = index;
        className += vertical ? " hor-start" : " ver-start";
      } else if (i === indexClassMap.size - 1) {
        className += vertical ? " hor-end" : " ver-end";
      } else {
        className += vertical ? " hor" : " ver";
      }

      const newIndex = vertical ? startVal + i : startVal + i * this.#boardSize;

      map.set(newIndex, className);
      i++;
    }
    return map;
  }

  #makeOutline(currCords, indexClassMap, domBoard, indexesToSkip, board) {
    const currIndex = cordsToIndex(currCords, this.#boardSize);
    const targetIndices = [];
    let isValid = true;

    //convert index offsets to actual indexes
    const values = [];
    for (const val of indexClassMap.keys()) {
      values.push(val + currIndex);
    }

    const vertical = isVertical(indexArrToCordsArr(values, this.#boardSize));
    const directionVal = vertical
      ? currIndex % this.#boardSize
      : Math.floor(currIndex / this.#boardSize);

    //get calculate if its a valid place
    for (const [offset] of indexClassMap) {
      const targetIndex = currIndex + offset;

      if (!this.#validOutline(targetIndex, vertical, directionVal, domBoard))
        return { val: null, valid: false };

      if (this.#isShipCell(targetIndex, board, indexesToSkip)) isValid = false;

      targetIndices.push(targetIndex);
    }

    this.#removeOutline();

    //add actual copy
    for (let i = 0; i < targetIndices.length; i++) {
      const index = targetIndices[i];
      const classList = [...indexClassMap.values()][i];
      const cell = domBoard.children[index];
      const newCell = document.createElement("div");
      newCell.className = isValid ? classList : classList + " cant-place";
      cell.appendChild(newCell);
      this.#copyCells.push(cell);
    }

    return { val: targetIndices, valid: isValid };
  }

  #removeOutline() {
    for (const cell of this.#copyCells) {
      const cellCopy = cell.children[1];
      if (cellCopy) cell.removeChild(cellCopy);
    }
    this.#copyCells = [];
  }

  #validOutline(targetIndex, vertical, directionVal, domBoard) {
    if (targetIndex < 0 || targetIndex >= domBoard.children.length) {
      return false;
    }
    const maxRow = Math.sqrt(domBoard.children.length);
    const targetDirectionVal = vertical
      ? targetIndex % maxRow
      : Math.floor(targetIndex / maxRow);
    if (targetDirectionVal !== directionVal) return false;

    return true;
  }

  #isShipCell(targetIndex, board, indexesToSkip) {
    if (indexesToSkip.includes(targetIndex)) return false;
    const shipIndexes = cordsArrToIndexArr(
      board.getAllShipCords(),
      this.#boardSize
    );
    if (shipIndexes.includes(targetIndex)) return true;
    return false;
  }
}

function getIndexToClassMap(offsets, anchor, domBoard) {
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
