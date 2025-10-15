export class Ship {
  #hit;
  #length;

  constructor(length) {
    if (length <= 0)
      throw new Error("Tried to instantiate Ship with Length < 0");

    this.#hit = 0;
    this.#length = length;
  }

  hit() {
    this.#hit++;
  }

  isSunk() {
    return this.#hit >= this.#length ? true : false;
  }
}
