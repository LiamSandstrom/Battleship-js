export function renderDefaultCell() {
  const div = document.createElement("div");
  div.classList.add("default-cell");
  return div;
}

export function renderDefaultCellHit() {
  const div = document.createElement("div");
  div.classList.add("default-cell-hit");
  return div;
}

export function renderShipCell() {
  const div = document.createElement("div");
  div.classList.add("ship-cell");
  return div;
}

export function renderShipCellHit() {
  const div = document.createElement("div");
  div.classList.add("ship-cell-hit");
  return div;
}
