// import { MPGameController } from "./MPGameController";

import type { ItoMitaiGame } from "./ItoMitaiGame";
import type { Player } from "./Player";
import type { ID, Question } from "./config";

export type RequiredGameState = {
  id: ID;
  lastUpdatedTime: number;
};

export type OptionalGameState = {
  questionPool?: Array<Question>;
  currentRound?: number;
  players?: Array<Player>;
  currentQuestion?: Question;
};

export type GameState = RequiredGameState & OptionalGameState;

export class GameDatabaseAPI {
  database: GameDatabase;

  constructor(database: GameDatabase = new GameDatabase()) {
    this.database = database;
  }

  getById(id: ID) {
    return this.database.get(id);
  }

  saveById(update: GameState) {
    return this.database.save(update);
  }

  static toGameState(game: ItoMitaiGame): GameState {
    return {
      id: game.id,
      lastUpdatedTime: Date.now(),
      questionPool: game.questionPool,
      currentQuestion: game.currentQuestion,
      players: game.players,
    };
  }
}

// there should only be one database across any number of server instances
// this should be replaced with some GCP solution
export class GameDatabase {
  games: Record<ID, GameState> = {};

  get = (id: ID) => {
    return this.games[id];
  };

  save = (update: GameState) => {
    const existing = this.games[update.id];

    if (existing && existing.lastUpdatedTime > update.lastUpdatedTime) {
      return;
    }

    this.games[update.id] = {
      ...this.games[update.id],
      ...update,
    };
  };

  delete = (id: ID) => {
    delete this.games[id];
  };

  reset = () => {
    this.games = {};
  };
}
