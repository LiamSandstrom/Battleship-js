import { indexToCords } from "../helpers/utils.js";

export function renderBoard(div, arr) {
  div.innerHTML = "";
  const rowSize = Math.sqrt(arr.length);
  div.style.gridTemplateColumns = `repeat(${rowSize}, 1fr)`;
  div.style.gridTemplateRows = `repeat(${rowSize}, 1fr)`;
  for (let i = 0; i < arr.length; i++) {
    const cellObj = arr[i];
    div.appendChild(createCell(cellObj));
  }

  function createCell(cellObj) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const cellContent = document.createElement("div");
    cell.appendChild(cellContent);
    addClassToCell(cellContent, cellObj);

    return cell;
  }

  function addClassToCell(cell, cellObj) {
    if (!cellObj.isHit && !cellObj.isShip) {
      cell.classList.add("default-cell");
    }

    if (cellObj.isHit && !cellObj.isShip) {
      cell.classList.add("default-cell-hit");
    }

    if (!cellObj.isHit && cellObj.isShip) {
      cell.classList.add("ship-cell");
    }

    if (cellObj.isHit && cellObj.isShip) {
      cell.classList.add("ship-cell-hit");
    }
  }
}

export function addBorderToShip(div, iArr, horizontal = undefined) {
  if (horizontal === undefined) {
    horizontal = iArr[0] + 1 === iArr[1] ? true : false;
  }

  for (let i = 0; i < iArr.length; i++) {
    const ele = div.children[iArr[i]].children[0];
    let className = "";
    if (i === 0) {
      className = horizontal ? "hor-start" : "ver-start";
    } else if (i === iArr.length - 1) {
      className = horizontal ? "hor-end" : "ver-end";
    } else {
      className = horizontal ? "hor" : "ver";
    }
    ele.classList.add(className);
  }
}

export function addCbToCells(cb, event, player, div) {
  const rowMax = Math.sqrt(div.children.length);
  for (let i = 0; i < div.children.length; i++) {
    const cell = div.children[i];
    const cords = indexToCords(i, rowMax);
    const handler = () => cb(cords, cell);

    let handlers = player.handlerMap.get(cell);
    if (!handlers) {
      handlers = new Map();
      player.handlerMap.set(cell, handlers);
    }

    handlers.set(event, handler);
    cell.addEventListener(event, handler);
  }
}

export function removeCbFromCells(event, player, div) {
  for (const cell of div.children) {
    const handlers = player.handlerMap.get(cell);
    if (handlers && handlers.has(event)) {
      const handler = handlers.get(event);
      cell.removeEventListener(event, handler);
      handlers.delete(event);
      if (handlers.size === 0) player.handlerMap.delete(cell);
    }
  }
}

export function startShipDrag(cellSize) {
  const shipCopy = document.createElement("div");

  function moveShip() {}
}
