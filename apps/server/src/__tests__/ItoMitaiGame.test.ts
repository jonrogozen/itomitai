import { getAnswerKey, ItoMitaiGame } from "../ItoMitaiGame";
import { Player } from "../Player";

describe("getAnswerKey", () => {
  test("returns sorted answers", () => {
    const a = new Player({ name: "duck" }),
      b = new Player({ name: "bing" }),
      c = new Player({ name: "bozo" }),
      d = new Player({ name: "hello" });

    const players = [a, b, c, d];

    a.numbers = [1];
    b.numbers = [2];
    c.numbers = [3];
    d.numbers = [4];

    const answers = getAnswerKey(players);

    expect(answers).toEqual([
      expect.objectContaining({ number: 1 }),
      expect.objectContaining({ number: 2 }),
      expect.objectContaining({ number: 3 }),
      expect.objectContaining({ number: 4 }),
    ]);

    expect(typeof answers[0].playerId).toEqual("string");
  });
});
