export class Ship {
  #length;
  #hit;
  #cords = [];
  constructor(length) {
    if (length <= 0)
      throw new Error("Tried to instantiate Ship with Length < 0");

    this.#length = length;
    this.#hit = 0;
  }

  get length() {
    return this.#length;
  }

  hit() {
    this.#hit++;
  }

  isSunk() {
    return this.#hit >= this.#length ? true : false;
  }
}
