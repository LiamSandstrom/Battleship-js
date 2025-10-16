export function renderBoard(div, arr, cellClickedCb) {
  div.innerHTML = "";
  const rowSize = Math.sqrt(arr.length);
  div.style.gridTemplateColumns = `repeat(${rowSize}, 1fr)`;
  div.style.gridTemplateRows = `repeat(${rowSize}, 1fr)`;
  for (let i = 0; i < arr.length; i++) {
    const cellObj = arr[i];
    const row = Math.floor(i / rowSize);
    const column = Math.floor(i % rowSize);
    div.appendChild(createCell(cellObj, [row, column], cellClickedCb));
  }

  function createCell(cellObj, cords, cellClickedCb) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    addClassToCell(cell, cellObj);

    cell.addEventListener("mousedown", () => cellClickedCb(cords, cell));

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
