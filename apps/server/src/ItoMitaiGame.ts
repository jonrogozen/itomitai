import { Player } from "./Player";
import { Question, getConfig, ID, Config, generateId } from "./config";
import { getRandomFromArray } from "./selectors";
import type { GameState } from "./GameDatabaseAPI";

export function getAnswerKey(players: Array<Player>) {
  const answerKey: Array<{ playerId: ID; number: number }> = [];

  players.forEach((player) => {
    player.numbers.forEach((num) => {
      answerKey.push({
        playerId: player.id,
        number: num,
      });
    });
  });

  answerKey.sort((a, b) => {
    if (a.number < b.number) {
      return -1;
    }

    if (a.number > b.number) {
      return 1;
    }

    return 0;
  });

  return answerKey;
}

export class ItoMitaiGame {
  id: ID;
  config: Config;
  players: Array<Player>;
  currentRound = 0;
  isGameOver: boolean = false;
  currentQuestion?: Question;
  questionPool: Array<Question>;

  constructor({
    config = getConfig(),
    players = [],
  }: {
    config?: Config;
    players?: Array<Player>;
  } = {}) {
    this.id = generateId();
    this.config = config;
    this.players = players;
    this.questionPool = [...this.config.questions];
  }

  //   loadFromGameState = (state: GameState) => {
  //     this.id = state.id;
  //     this.players = state.players || [];
  //     this.currentRound = state.currentRound || 0;
  //     this.currentQuestion = state.currentQuestion;
  //     this.questionPool = state.questionPool || this.config.questions;
  //   };

  getActivePlayers = () => {
    return this.players.filter((player) => player.active);
  };

  addPlayer = (name: string) => {
    this.players.push(new Player({ name }));
    this.players.forEach((player) => player.clear());
  };

  removePlayer = (id: ID) => {
    const i = this.players.findIndex((player) => player.id === id);

    if (i > -1) {
      this.players.splice(i, 1);
      this.players.forEach((player) => player.clear());
    }
  };

  getPlayerById = (id: ID) => {
    return this.players.find((player) => player.id === id);
  };

  private assignNumbersToPlayers = () => {
    const numbers = [...this.config.numbers];

    this.players.forEach((player) => {
      for (let i = 0; i < this.config.numbersAssignedPerRound; i++) {
        const rand = getRandomFromArray(numbers);

        numbers.splice(rand.index, 1);

        player.addAssignedNumber(rand.value);
      }
    });
  };

  private scoreGuesses = () => {
    if (!this.players.every((player) => player.playerOrderGuess.length)) {
      throw new Error(
        "cannot score guesses, not every player has submitted a guess"
      );
    }

    const answerKey = getAnswerKey(this.players);

    this.players.forEach((player) => {
      let everyAnswerCorrect = true;

      player.playerOrderGuess.forEach((guess, i) => {
        if (guess === answerKey[i].playerId) {
          const answerPlayer = this.getPlayerById(answerKey[i].playerId);

          player.addScore(
            this.config.scoreRuleset.pointsPerCorrectPositionalGuess
          );
          answerPlayer?.addScore(this.config.scoreRuleset.pointsPerTeamPicks);
        } else {
          everyAnswerCorrect = false;
        }
      });

      if (everyAnswerCorrect) {
        player.addScore(this.config.scoreRuleset.pointsForPerfectRanking);
      }
    });
  };

  startRound = () => {
    if (this.currentRound >= this.config.rounds) {
      throw new Error("already at max rounds");
    }

    const question = getRandomFromArray(this.questionPool);

    this.currentRound++;
    this.currentQuestion = question.value;
    this.questionPool.splice(question.index, 1);
    this.players.forEach((player) => player.setActivity(true));
    this.assignNumbersToPlayers();
  };

  finishRound = () => {
    this.scoreGuesses();
    this.players.forEach((player) => player.clear());
    this.currentQuestion = undefined;

    if (this.currentRound >= this.config.rounds) {
      this.isGameOver = true;
    }
  };

  submitGuess = (playerId: string, guessPlayerIDsInOrder: Array<string>) => {
    const player = this.getPlayerById(playerId);

    if (!player) {
      throw new Error(`no player found with playerId=${playerId}`);
    }

    player.addGuess(guessPlayerIDsInOrder, this.getActivePlayers().length);
  };

  reset = () => {
    this.currentRound = 0;
    this.questionPool = [...this.config.questions];
    this.players.forEach((player) => player.reset());
  };
}
