import { Player } from "../Player";
import { generateId } from "../config";

jest.mock("../config", () => {
  return {
    generateId: () => "test_id",
  };
});

describe("Player", () => {
  test("creates a player with id and name", () => {
    const player = new Player({ name: "duck" });

    expect(player.name).toBe("duck");
    expect(player.id).toBe("test_id");
  });

  test("increments score", () => {
    const player = new Player({ name: "duck" });

    expect(player.score).toBe(0);

    player.addScore(10);

    expect(player.score).toBe(10);

    player.addScore(1);

    expect(player.score).toBe(11);
  });

  test("add an assigned number", () => {
    const player = new Player({ name: "duck" });

    player.addAssignedNumber(10);
    player.addAssignedNumber(4);

    expect(player.numbers).toEqual(expect.arrayContaining([10, 4]));
  });

  test("adds guess", () => {
    const player = new Player({ name: "duck" });

    player.addGuess(["abc", "def", "ghi"], 3);

    expect(player.playerOrderGuess).toEqual(["abc", "def", "ghi"]);
  });

  test("fails if guess does not include enough players", () => {
    const player = new Player({ name: "duck" });

    expect(() => player.addGuess(["abc", "def"], 3)).toThrowError();
  });

  test("can clear in-between rounds and preserves score", () => {
    const player = new Player({ name: "duck" });

    player.addScore(10);
    player.addAssignedNumber(1);
    player.clear();

    expect(player.score).toEqual(10);
    expect(player.playerOrderGuess).toEqual([]);
    expect(player.numbers).toEqual([]);
  });

  test("can reset", () => {
    const player = new Player({ name: "duck" });

    player.addScore(10);
    player.addAssignedNumber(1);
    player.addGuess(["1", "2"], 2);
    player.reset();

    expect(player.score).toEqual(0);
    expect(player.playerOrderGuess).toEqual([]);
    expect(player.numbers).toEqual([]);
  });
});
