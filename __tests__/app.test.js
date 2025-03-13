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

describe("/api/users", () => {
  describe("GET", () => {
    test("200: Responds with an array of user objects with username, name, and avatar_url properties for all users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({body: {users}}) => {
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBe(4);

          users.forEach((user) => {
            const {username, name, avatar_url} = user;

            expect(typeof username).toBe("string");
            expect(typeof name).toBe("string");
            expect(typeof avatar_url).toBe("string");
          })
        })
    })
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
            expect(typeof article.author).toBe("string");
            expect(article).toHaveProperty("title");
            expect(typeof article.title).toBe("string");
            expect(article).toHaveProperty("article_id");
            expect(typeof article.article_id).toBe("number");
            expect(article).toHaveProperty("topic");
            expect(typeof article.topic).toBe("string");
            expect(article).toHaveProperty("created_at");
            expect(typeof article.created_at).toBe("string")
            expect(article).toHaveProperty("votes");
            expect(typeof article.votes).toBe("number");
            expect(article).toHaveProperty("article_img_url");
            expect(typeof article.article_img_url).toBe("string");
            expect(article).toHaveProperty("comment_count");
            expect(typeof article.comment_count).toBe("number");
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
    test("200: Responds with article object including comment_count", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({body: {article}}) => {
          const date = new Date(1594329060000).toISOString;
          expect(article.article_id).toBe(1);
          expect(article.title).toBe("Living in the shadow of a great man");
          expect(article.topic).toBe("mitch");
          expect(article.author).toBe("butter_bridge");
          expect(article.body).toBe("I find this existence challenging");
          expect(new Date(article.created_at).toISOString).toBe(date);
          expect(article.votes).toBe(100);
          expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
          expect(article).toHaveProperty("comment_count");
          expect(article.comment_count).toBe(11);
        })
    })
    test("200: Responds with comment_count of 0 if no comments exist for the specified article", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({body: {article}}) => {
          expect(article.comment_count).toBe(0);
        })
    })
  })
  describe("PATCH", () => {
    test("200: Responds with the updated article after increasing votes", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({inc_votes: 5})
        .expect(200)
        .then(({body: {article}}) => {
          expect(article.article_id).toBe(3);
          expect(article.votes).toBe(5);
        })
    })
    test("200: Responds with the updated article after decreasing votes", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({inc_votes: -5})
        .expect(200)
        .then(({body: {article}}) => {
          expect(article.article_id).toBe(3);
          expect(article.votes).toBe(-5);
        })
    })
    test("404: Responds with article not found if article_id does not exist", () => {
      return request(app)
        .patch("/api/articles/9999")
        .send({inc_votes: 1})
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("article not found");
        })
    })
    test("400: Responds with bad request if inc_votes is missing from request", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
    test("400: Responds with bad request if article_id is not a number", () => {
      return request(app)
        .patch("/api/articles/not-a-number")
        .send({inc_votes: 2})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
    test("400: Responds with bad request if inc_votes is not a number", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({inc_votes: "not-a-number"})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
    test("200: Ignores any additional properties other than inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({inc_votes: 50, body: "This text should be ignored"})
        .expect(200)
        .then(({body: {article}}) => {
          expect(article.article_id).toBe(1);
          expect(article.votes).toBe(150);
          expect(article.body).not.toBe("This text should be ignored");
          expect(article.body).toBe("I find this existence challenging");
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

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("204: Successfully deletes a comment and returns no content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(() => {
          return db.query("SELECT * FROM comments WHERE comment_id = 1;");
        }).then(({rows}) => {
          expect(rows.length).toBe(0);
        })
    })
    test("404: Responds with comment not found if comment_id does not exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("comment not found");
        })
    })
    test("400: Responds with bad request if comment_id is not a number", () => {
      return request(app)
        .delete("/api/comments/not-a-number")
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
  })
})