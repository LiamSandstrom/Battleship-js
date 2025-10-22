import { Controller } from "./Controller.js";
import { GameBoard } from "./logic/GameBoard.js";
import { Player } from "./Player.js";

const maxBoardSize = 30;
const minBoardSize = 3;
const maxShipSize = maxBoardSize;

function init(boardSize, ships, isAi = false) {
  if (boardSize > maxBoardSize) boardSize = maxBoardSize;

  const controller = new Controller({
    boardSize: boardSize,
    p2IsAI: isAi,
    ships: ships,
  });
  const menuRef = document.querySelector("#ai-or-pvp");
  const content = document.querySelector("#content-wrapper");
  try {
    controller.initialShipSpawn();
    controller.render();
    document.body.removeChild(menuRef);
    content.style.visibility = "visible"
  } catch (e) {
    menuRef.style.visibility = "visible";
    const buttons = document.querySelector("#buttons");
    buttons.innerHTML = "";
    alert(e);
  }
}

function initChooseOpponent() {
  const div = document.querySelector("#ai-or-pvp");
  const aiBtn = document.querySelector("#ai-btn");
  const pvpBtn = document.querySelector("#pvp-btn");
  const customBtn = document.querySelector("#custom-settings-btn");

  let boardSize = 10;
  let shipArr = [5, 4, 3, 3, 2];

  aiBtn.addEventListener("click", () => {
    div.style.visibility = "hidden";
    init(boardSize, shipArr, true);
  });

  pvpBtn.addEventListener("click", () => {
    div.style.visibility = "hidden";
    init(boardSize, shipArr);
  });

  customBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("custom-settings");

    const boardText = document.createElement("h3");
    const shipsText = document.createElement("h3");
    const boardSizeInput = document.createElement("input");
    const ships = document.createElement("input");

    boardText.textContent = `Board size (${minBoardSize}-${maxBoardSize})`;
    shipsText.textContent = `Ships in length (2-${maxShipSize})`;

    boardSizeInput.value = boardSize;
    ships.value = shipArr.sort((a, b) => b - a);

    ships.addEventListener("input", () => {
      let value = ships.value;
      value = value.replace(/[^0-9,]/g, "");
      value = value.replace(/,+/g, ",");
      value = value.replace(/^,*/, "");
      ships.value = value;
    });

    const shipDiv = document.createElement("div");
    shipDiv.appendChild(shipsText);
    shipDiv.appendChild(ships);

    const boardDiv = document.createElement("div");
    boardDiv.appendChild(boardText);
    boardDiv.appendChild(boardSizeInput);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";

    closeBtn.addEventListener("click", () => {
      const boardValue = Number(boardSizeInput.value);
      const shipValues = ships.value.split(",").map(Number);

      if (
        isNaN(boardValue) ||
        boardValue < minBoardSize ||
        boardValue > maxBoardSize
      ) {
        alert(
          `Board size must be a number between ${minBoardSize} and ${maxBoardSize}.`
        );
        return;
      }

      const invalidShip = shipValues.some(
        (s) => isNaN(s) || s < 2 || s > maxBoardSize
      );
      if (invalidShip) {
        alert(
          `Each ship length must be a number between 2 and ${maxShipSize}.`
        );
        return;
      }

      const tooBig = shipValues.some((s) => s > boardValue);
      if (tooBig) {
        alert("No ship can be larger than the board size.");
        return;
      }

      boardSize = boardValue;
      shipArr = shipValues;
      document.body.removeChild(div);
    });

    div.appendChild(shipDiv);
    div.appendChild(boardDiv);
    div.appendChild(closeBtn);

    document.body.appendChild(div);
  });
}

initChooseOpponent();

//init();
