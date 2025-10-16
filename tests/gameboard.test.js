import { GameBoard, inRange } from "../src/GameBoard";
import { create2dArray } from "../src/GameBoard";
import { isValidShip } from "../src/GameBoard";
import { Ship } from "../src/Ship";
import { Cell } from "../src/GameBoard";

test("create2dArray throws if size <= 0", () => {
  expect(() => create2dArray(0)).toThrow(
    "Tried to create 2dArray with size <= 0"
  );
  expect(() => create2dArray(-10)).toThrow(
    "Tried to create 2dArray with size <= 0"
  );
});

test("create2dArray creates correct size", () => {
  const size = 5;
  const arr = create2dArray(size);

  expect(arr.length).toBe(size);
  arr.forEach((row) => expect(row.length).toBe(size));
});

test("create2dArray fills with correct value", () => {
  const fillValue = 0;
  create2dArray(5, fillValue).forEach((row) =>
    row.forEach((cell) => expect(cell).toBe(fillValue))
  );
});

describe("InRange bounds test", () => {
  test.each([
    { cords: [100, 6], size: 7 },
    { cords: [10, 2], size: 10 },
    { cords: [-5, -2], size: 3 },
  ])("Cords: $cords with size: $size should throw", ({ cords, size }) => {
    expect(() => inRange(cords, size)).toThrow("OUT OF RANGE");
  });

  test.each([{ cords: [6, 0], size: 7, expected: true }])(
    "Cords: $cords with size: $size expected $expected",
    ({ cords, size, expected }) => {
      const result = inRange(cords, size);
      expect(result).toBe(expected);
    }
  );
});

test("isValidShip", () => {
  expect(isValidShip({ length: 1 })).toBe(false);
  const s = new Ship(2);
  expect(isValidShip(s)).toBe(true);
});

test("getCell", () => {
  const gb = new GameBoard(5);
  expect(gb.getCell([3, 4]) instanceof Cell).toBe(true);
});

test("placeShip places ship in correct cells", () => {
  const gb = new GameBoard(5);
  const s = new Ship(3);
  const shipCords = [
    [0, 0],
    [0, 1],
    [0, 2],
  ];

  gb.placeShip(shipCords, s);
  for (const cord of shipCords) {
    const cell = gb.getCell(cord);
    expect(cell.value).toBe(s);
  }
  expect(gb.getCell([0, 3])).not.toBe(s);
});

test("receiveAttack on ship", () => {
  const gb = new GameBoard(5);
  const s = new Ship(3);
  const shipCords = [
    [0, 0],
    [0, 1],
    [0, 2],
  ];
  gb.placeShip(shipCords, s);

  gb.receiveAttack([0, 1]);

  const cell = gb.getCell([0, 1]);
  expect(cell.isHit()).toBe(true);
});

test("receiveAttack on empty", () => {
  const gb = new GameBoard(5);

  gb.receiveAttack([0, 1]);

  const cell = gb.getCell([0, 1]);
  expect(gb.getCell([0, 0]).isHit()).toBe(false);
  expect(cell.isHit()).toBe(true);
});

describe("GameBoard AllShipsSunken", () => {
  test("returns true if all ships are sunk", () => {
    const board = new GameBoard(5);

    const ship1 = new Ship(2);
    const ship2 = new Ship(3);

    board.placeShip(
      [
        [0, 0],
        [0, 1],
      ],
      ship1
    );
    board.placeShip(
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      ship2
    );

    expect(board.AllShipsSunken()).toBe(false);

    ship1.hit([0, 0]);
    ship1.hit([0, 1]);

    expect(board.AllShipsSunken()).toBe(false);

    ship2.hit([1, 0]);
    ship2.hit([1, 1]);
    ship2.hit([1, 2]);

    expect(board.AllShipsSunken()).toBe(true);
  });

  test("returns true if there are no ships", () => {
    const board = new GameBoard(5);
    expect(board.AllShipsSunken()).toBe(true);
  });
});
