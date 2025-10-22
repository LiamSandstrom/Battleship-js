import { Controller } from "./Controller.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";

function init(isAi = false) {
  const controller = new Controller({
    boardSize: 10,
    p2IsAI: isAi,
  });
  controller.initialShipSpawn();
  controller.render();
}

function initChooseOpponent() {
  const div = document.querySelector("#ai-or-pvp");
  const aiBtn = document.querySelector("#ai-btn");
  const pvpBtn = document.querySelector("#pvp-btn");

  aiBtn.addEventListener("click", () => {
    removeDiv();
    init(true);
  });

  pvpBtn.addEventListener("click", () => {
    removeDiv();
    init();
  });

  function removeDiv() {
    document.body.removeChild(div);
  }
}

initChooseOpponent();

//init();
