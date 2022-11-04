import { generateId, ID } from "./config";

import { uniqueArray } from "./selectors";

export class Player {
  id: ID;
  name: string;
  active: boolean = false;
  numbers: Array<number> = [];
  playerOrderGuess: Array<ID> = [];

  private _score: number = 0;

  constructor({ name }: { name: string }) {
    this.id = generateId();
    this.name = name;
  }

  get score(): number {
    return this._score;
  }

  addScore(points: number) {
    if (points > 0) {
      this._score += points;
    }
  }

  addAssignedNumber = (number: number) => {
    this.numbers.push(number);
  };

  clear = () => {
    this.numbers = [];
    this.playerOrderGuess = [];
  };

  reset = () => {
    this._score = 0;
    this.clear();
  };

  setActivity(active: boolean) {
    this.active = active;
  }

  addGuess = (guessPlayerIDsInOrder: Array<ID>, playerCount: number) => {
    const uniqueGuesses = guessPlayerIDsInOrder.filter(uniqueArray);

    if (uniqueGuesses.length !== playerCount) {
      throw new Error("invalid guess, does not include every player");
    }

    this.playerOrderGuess = uniqueGuesses;
  };
}
