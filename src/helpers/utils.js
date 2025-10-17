export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cordsToIndex(cords, rowMax) {
  const row = cords[0];
  const column = cords[1];
  return row * rowMax + column;
}

export function cordsArrToIndexArr(cordsArr, rowMax) {
  const res = [];
  for (const cords of cordsArr) {
    const row = cords[0];
    const column = cords[1];
    res.push(row * rowMax + column);
  }
  return res;
}

export function indexToCords(index, rowMax) {
  const row = Math.floor(index / rowMax);
  const column = index % rowMax;
  return [row, column];
}
