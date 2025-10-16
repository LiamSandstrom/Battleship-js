export class Ship {
  #length;
  #hitCords;

  constructor(length) {
    if (length <= 0)
      throw new Error("Tried to instantiate Ship with Length < 0");

    this.#length = length;
    this.#hitCords = [];
  }

  get length() {
    return this.#length;
  }

  hit(cords) {
    this.#hitCords.push(cords);
  }

  areCordsHit(cords) {
    return this.#hitCords.some(
      (c) => c.length === cords.length && c.every((v, i) => v === cords[i])
    );
  }

  isSunk() {
    return this.#hitCords.length >= this.#length ? true : false;
  }
}
