import { Controller } from "./Controller.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";

const board1 = new GameBoard(10);
const board2 = new GameBoard(10);

const p1 = new Player(board1);
const p2 = new Player(board2);

const controller = new Controller(p1, p2);
controller.init();
