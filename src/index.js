import { Controller } from "./Controller.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";
import { BoardUI } from "./UI/BoardUI.js";

const board1 = new GameBoard(10);
const board2 = new GameBoard(10);

const p1 = new Player(board1);
const p2 = new Player(board2);

document.querySelector("#p1-board");
document.querySelector("#p2-board");
const ui = new BoardUI();
const controller = new Controller();
