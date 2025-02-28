const {
  convertTimestampToDate,
  createRef
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  it("Returns an object", () => {
      const inputArray = [{ name: "Rose", id: "dS8rJns", secretFear: "spiders" }];
      const result = createRef(inputArray, "name", "id");
      expect(typeof result).toBe("object");
  });
  it("Returns an object mapping the values of passed properties from an array with 1 object entry", () => {
      const inputArray = [{ name: "Rose", id: "dS8rJns", secretFear: "spiders" }];
      const expected = { Rose: "dS8rJns"};
      const result = createRef(inputArray, "name", "id");
      expect(result).toEqual(expected);
  });
  it("Returns an object mapping the values of passed properties from an array with many objects", () => {
      const inputArray = [
          { name: "Rose", id: "dS8rJns", secretFear: "spiders" },
          { name: "Simon", id: "Pk34ABs", secretFear: "mice" },
          { name: "Jim", id: "lk1ff8s", secretFear: "bears" },
          { name: "David", id: "og8r0nV", secretFear: "Rose" },
        ];
      const expected = { Rose: "spiders", Simon: "mice", Jim: "bears", David: "Rose" };
      const result = createRef(inputArray, "name", "secretFear");
      expect(result).toEqual(expected);
  });
  describe("Purity tests", () => {
    it("Function does not mutate original input", () => {
        const inputArray = [{ name: "Rose", id: "dS8rJns", secretFear: "spiders" }];
        const originalInput = [{ name: "Rose", id: "dS8rJns", secretFear: "spiders" }];
        createRef(inputArray, "id", "secretFear");
        expect(inputArray).toEqual(originalInput);
    })
  })
});
