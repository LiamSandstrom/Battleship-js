import { Ship } from "../src/logic/Ship";

test("isSunk returns true only after enough hits", () => {
  const s = new Ship(2);
  expect(s.isSunk()).toBe(false);
  s.hit([0, 0]);
  expect(s.isSunk()).toBe(false);
  s.hit([0, 1]);
  expect(s.isSunk()).toBe(true);
  s.hit([0, 2]);
  expect(s.isSunk()).toBe(true);
});

test("Ship throws when instantiated with length <= 0", () => {
  expect(() => new Ship(0)).toThrow(
    "Tried to instantiate Ship with Length < 0"
  );
  expect(() => new Ship(-10)).toThrow(
    "Tried to instantiate Ship with Length < 0"
  );
});
