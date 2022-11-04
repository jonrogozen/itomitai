import { getRandomFromArray, uniqueArray } from "../selectors";

describe("uniqueArray", () => {
  test("filters non-unique values", () => {
    expect([1, 3, 2, 1, 2].filter(uniqueArray)).toEqual(
      expect.arrayContaining([1, 2, 3])
    );
  });

  test("works with any value", () => {
    expect([1, 3, "hello", 3, "hello"].filter(uniqueArray)).toEqual(
      expect.arrayContaining([1, 3, "hello"])
    );
  });

  test("works with unique array", () => {
    expect([1, 2, 3].filter(uniqueArray)).toEqual(
      expect.arrayContaining([1, 2, 3])
    );
  });
});

describe("getRandomFromArray", () => {
  test("returns index and value", () => {
    const rand = getRandomFromArray([1, 10, 100]);

    expect([0, 1, 2]).toContain(rand.index);
    expect([1, 10, 100]).toContain(rand.value);
  });
});
