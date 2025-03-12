const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
require("jest-sorted");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  test("GET 200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("404: Responds with path not found when invalid path entered", () => {
    return request(app)
      .get("/invalidpath")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe("path not found");
      });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("200: Responds with array of topic objects with slug and description properties", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body: {topics}}) => {
          expect(topics.length).toBe(3)

          topics.forEach(topic => {
            const {slug, description} = topic;

            expect(typeof slug).toBe("string");
            expect(typeof description).toBe("string");
          });
        })
    });
  })
})

describe("/api/articles", () => {
  describe("GET", () => {
    test("200 Responds with array of all articles with all properties of articles and a comment_count property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles.length).toBe(13);

          articles.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
            expect(article).toHaveProperty("article_img_url");
            expect(article).toHaveProperty("comment_count");
          })
        })
    })
    test("200 Responds with filtered array of articles by author 'icellusedkars'", () => {
      return request(app)
        .get("/api/articles?author=icellusedkars")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles.length).toBe(6);

          articles.forEach((article) => {
            expect(article.author).toBe("icellusedkars");
          })
        })
    })
    test("200 Responds with filtered array of articles by topic 'mitch'", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles.length).toBe(12);

          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          })
        })
    })
    test("200 Responds with sorted array by queried parameter (article_id)", () => {
      return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({body: {articles}}) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles).toBeSortedBy("article_id");
      })
    })
    test("200 Responds with sorted array by default value (created_at) in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toBeSortedBy("created_at", { descending: true});
        })
    })
    test("200 Responds with sorted array by queried parameter (comment_count) and ordered by queried parameter (ascending)", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count&order=asc")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toBeSortedBy("comment_count", {ascending: true})
        })
    })
    test("400 Responds with invalid query parameter: sort_by if passed in any value outside of the sort_by greenlist", () => {
      return request(app)
      .get("/api/articles?sort_by=notAValidColumnName")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("invalid query parameter: sort_by");
      })
    })
    test("400 Responds with invalid query parameter: order if passed in any value outside of the order greenlist", () => {
      return request(app)
      .get("/api/articles?sort_by=title&order=random")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("invalid query parameter: order");
      })
    })
    test("404 Responds with username (the column) not found if passed in an author that doesn't exist in the users table", () => {
      return request(app)
        .get("/api/articles?author=notARealUser")
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("username not found");
        })
    })
    test("404 Responds with slug not found if passed in a topic that doesn't exist in the topics table", () => {
      return request(app)
      .get("/api/articles?topic=notARealTopic")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe("slug not found");
      })
    })
    test("200 Responds with empty array when a valid query is made but there are no results", () => {
      return request(app)
      .get("/api/articles?author=lurker&topic=cats")
      .expect(200)
      .then(({body: {articles}}) => {
        expect(articles.length).toBe(0);
      })
    })
  })
})

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("200: Responds with an article object with all of its properties", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({body: {article}}) => {
          const date = new Date(1604394720000).toString();
          expect(article.author).toBe("icellusedkars");
          expect(article.title).toBe("Eight pug gifs that remind me of mitch");
          expect(article.article_id).toBe(3);
          expect(article.body).toBe("some gifs");
          expect(article.topic).toBe("mitch");
          expect(new Date(article.created_at).toString()).toBe(date);
          expect(article.votes).toBe(0);
          expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
        })
    })
    test("400: Responds with bad request if article_id is not a number", () => {
      return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("bad request");
      })
    })
    test("404: Responds with article not found if article_id is valid but returns nothing", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("article not found");
        })
    })
  })
})

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("200: Responds with an array of comments for the given article_id sorted by most recent first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({body: {comments}}) => {
          expect(Array.isArray(comments)).toBe(true);
          expect(comments.length).toBe(11);
          expect(comments).toBeSortedBy("created_at", {descending: true});

          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          })
        })
    })
    test("200: Responds with empty array if no comments exist for given article_id", () => {
      return request(app)
        .get("/api/articles/4/comments")
        .expect(200)
        .then(({body: {comments}}) => {
          expect(comments.length).toBe(0);
        })
    })
    test("400: Responds with bad request if article_id is not a number", () => {
      return request(app)
        .get("/api/articles/not-a-number/comments")
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
    test("404: Responds with article_id not found if article_id does not exist", () => {
      return request(app)
        .get("/api/articles/9999/comments")
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("article_id not found");
        })
    })
  })
  describe("POST", () => {
    test("201: successfully posts comment on given article", () => {
      const testComment = {
        username: "lurker",
        body: "Great article!"
      };

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(201)
        .then(({body: {comment}}) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment.author).toBe(testComment.username);
          expect(comment.body).toBe(testComment.body);
          expect(comment.article_id).toBe(1);
        })
    })
    test("404: Responds with article not found if article_id does not exist", () => {
      const testComment = {
        username: "lurker",
        body: "it's ok."
      };

      return request(app)
        .post("/api/articles/999/comments")
        .send(testComment)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("article not found");
        })
    })
    test("404: Responds with user not found if username does not exist", () => {
      const testComment = {
        username: "invalidUser",
        body: "hello world"
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("user not found");
        })
    })
    test("400: Responds with username is missing from request if username is missing in the request", () => {
      const testComment = {
        body: "hello world"
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("username is missing from request");
        })
    })
    test("400: Responds with body is missing from request if body is missing in the request", () => {
      const testComment = {
        username: "lurker"
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("body is missing from request");
        })
    })
    test("400: Responds with bad request if article_id is not a number", () => {
      const testComment = {
        username: "lurker",
        body: "This is my favourite article on here"
      }

      return request(app)
        .post("/api/articles/not-a-number/comments")
        .send(testComment)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request")
        })
    })
    test("400: Responds with bad request if request body is not a string", () => {
      const testComment = {
        username: "lurker",
        body: 123
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
    test("201: Should prevent SQL injection and handle malicious input gracefully" , () => {
      const testComment = {
        username: "lurker",
        body: "Nice Article!; DROP TABLE comments;"
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(201)
        .then(({body: {comment}}) => {
          expect(comment.body).toBe(testComment.body);
        })
    })
  })
})