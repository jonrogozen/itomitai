import { v4 } from "uuid";

export type ID = string;

export type Question = {
  en: string;
  ja: string;
  tags: Array<string>;
  level: number;
};

export type ScoreRuleset = {
  pointsPerCorrectPositionalGuess: number;
  pointsForPerfectRanking: number;
  pointsPerTeamPicks: number;
};

export type Config = {
  language: "en" | "ja";
  questions: Array<Question>;
  numbers: Array<number>;
  numbersAssignedPerRound: number;
  rounds: number;
  scoreRuleset: ScoreRuleset;
};

export function generateId() {
  return v4();
}

export function getConfig(): Config {
  return {
    language: "en",
    questions: [
      {
        en: "popular animals",
        ja: "人気な動物",
        tags: ["animals", "popularity"],
        level: 1,
      },
      {
        en: "things kids want",
        ja: "子供が欲しい物",
        tags: ["popularity", "kids"],
        level: 1,
      },
    ],
    numbers: Array.from(new Array(100), (_, i) => i + 1),
    numbersAssignedPerRound: 1,
    rounds: 3,
    scoreRuleset: {
      pointsPerCorrectPositionalGuess: 1,
      pointsForPerfectRanking: 1,
      pointsPerTeamPicks: 1,
    },
  };
}
