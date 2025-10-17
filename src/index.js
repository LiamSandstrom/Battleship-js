import { Controller } from "./Controller.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";

function init() {
  const controller = new Controller({
    boardSize: 10,
  });
  controller.initialShipSpawn();
  controller.render();
}

init();
