const {
  convertTimestampToDate,
  createRef,
  formatData,
  replaceArticleTitleWithId,
  checkExists
} = require("../db/seeds/utils");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

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

describe("formatData", () => {
  it("Returns a nested array", () => {
    const testData = [{name: "John JavaScript", age: 30}];
    const testKeys = ["name", "age"];
    const result = formatData(testData, testKeys);
    expect(Array.isArray(result)).toBe(true);
    expect(Array.isArray(result[0])).toBe(true);
  });
  it("Returns a nested array of values in the order of keys passed in from array with 1 object", () => {
    const testData = [{name: "John JavaScript", age: 30}];
    const testKeys = ["name", "age"];
    const expected = [["John JavaScript", 30]];
    const result = formatData(testData, testKeys);
    expect(result).toEqual(expected);
  });
  it("Returns a nested array of values in the order of keys passed in from array with many objects", () => {
    const testData = [
      {name: "John JavaScript", age: 30},
      {name: "Sam Scala", age: 24}
    ];
    const testKeys = ["name", "age"];
    const expected = [
      ["John JavaScript", 30],
      ["Sam Scala", 24]
    ]
    const result = formatData(testData, testKeys);
    expect(result).toEqual(expected);
  });
  describe("Purity tests:", () => {
    it("Function does not mutate original input", () => {
      const testData = [
        {name: "John JavaScript", age: 30},
        {name: "Sam Scala", age: 24}
      ];
      const testKeys = ["name", "age"];
      const originalTestData = [
        {name: "John JavaScript", age: 30},
        {name: "Sam Scala", age: 24}
      ];
      const originalTestKeys = ["name", "age"];
      formatData(testData, testKeys);
      expect(testData).toEqual(originalTestData);
      expect(testKeys).toEqual(originalTestKeys);
    });
  })
})

describe("replaceArticleTitleWithId", () => {
  it("Returns a nested array", () => {
    const testArray = [
      {article_title: 'Living in the shadow of a great man', body: "I find this existence challenging"}
    ];
    const testRef = {
      'Living in the shadow of a great man' : 1
    };
    const result = replaceArticleTitleWithId(testArray, testRef);
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result[0]).toBe("object");
  });
  it("Returns an array where article_title is replaced with article_id from passed reference for an array with a single object", () => {
    const testArray = [
      {article_title: 'Living in the shadow of a great man', body: "I find this existence challenging"}
    ];
    const testRef = {
      'Living in the shadow of a great man' : 1
    };
    const expected = [
      {article_id: 1, body: "I find this existence challenging"}
    ]
    const result = replaceArticleTitleWithId(testArray, testRef);
    expect(result).toEqual(expected);
  });
  it("Returns an array where article_title is replaced with article_id from passed reference for an array with many objects", () => {
    const testArray = [
      {article_title: 'Living in the shadow of a great man', body: "I find this existence challenging"},
      {article_title: "Eight pug gifs that remind me of mitch", body: "some gifs"}
    ];
    const testRef = {
      'Living in the shadow of a great man' : 1,
      "Eight pug gifs that remind me of mitch": 2
    };
    const expected = [
      {article_id: 1, body: "I find this existence challenging"},
      {article_id: 2, body: "some gifs"}
    ]
    const result = replaceArticleTitleWithId(testArray, testRef);
    expect(result).toEqual(expected);
  });
  describe("Purity tests:", () => {
    it("Function does not mutate original input", () => {
      const testArray = [
        {article_title: 'Living in the shadow of a great man', body: "I find this existence challenging"}
      ];
      const testRef = {
        'Living in the shadow of a great man' : 1
      };
      const originalTestArray = [
        {article_title: 'Living in the shadow of a great man', body: "I find this existence challenging"}
      ];
      const originalTestRef = {
        'Living in the shadow of a great man' : 1
      };
      replaceArticleTitleWithId(testArray, testRef);
      expect(testArray).toEqual(originalTestArray);
      expect(testRef).toEqual(originalTestRef);
    })
  })
})

describe("checkExists", () => {

  beforeEach(() => {
    return seed(testData);
  });
  
  afterAll(() => {
    return db.end();
  });

  it("If checked value exists returns true", () => {
    const testTable = "users";
    const testColumn = "username";
    const testValue = "lurker";
    const result = checkExists(testTable, testColumn, testValue);
    expect(result).resolves.toBe(true);
  })
  it("If checked value doesn't exist returns Promise.reject", () => {
    const testTable = "users";
    const testColumn = "username";
    const testValue = "notARealPerson";
    const result = checkExists(testTable, testColumn, testValue);
    expect(result).resolves.toBe(false);
  })
})
