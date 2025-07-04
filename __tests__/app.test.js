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

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("200: Responds with user object with username, name, and avatar_url properties.", () => {
      return request(app)
        .get("/api/users/lurker")
        .expect(200)
        .then(({body: {user}}) => {
          expect(user).toHaveProperty("username");
          expect(user.username).toBe("lurker");
          expect(user).toHaveProperty("name");
          expect(user.name).toBe("do_nothing");
          expect(user).toHaveProperty("avatar_url");
          expect(user.avatar_url).toBe("https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png");
        })
    })
    test("404: Responds with 'User not found' if invalid username is entered", () => {
      return request(app)
        .get("/api/users/grumpy18")
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("User not found");
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
        .then(({body}) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles.length).toBe(10);
          expect(typeof body.total_count).toBe("number");
          expect(body.total_count).toBe(13);

          body.articles.forEach((article) => {
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
        .then(({body}) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.total_count).toBe(6);
          expect(body.articles.length).toBe(6);

          body.articles.forEach((article) => {
            expect(article.author).toBe("icellusedkars");
          })
        })
    })
    test("200 Responds with filtered array of articles by topic 'mitch'", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({body: {articles, total_count}}) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles.length).toBe(10);
          expect(total_count).toBe(12);

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
    test("200 Responds with paginated articles - limit and page number", () => {
      return request(app)
        .get("/api/articles?limit=5&p=2")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles.length).toBeLessThanOrEqual(5);
          expect(typeof body.total_count).toBe("number");
        });
    });
    test("200 Responds with empty array if page number exceeds total pages", () => {
      return request(app)
        .get("/api/articles?limit=5&p=999")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles.length).toBe(0);
        });
    });
    test("400 Responds with invalid query parameter if limit is not a number", () => {
      return request(app)
        .get("/api/articles?limit=notANumber")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("invalid limit or page query");
        });
    });

    test("400 Responds with invalid query parameter if page is not a number", () => {
      return request(app)
        .get("/api/articles?p=notANumber")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("invalid limit or page query");
        });
    });

    test("200 Responds with total_count that ignores limit/pagination", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(typeof body.total_count).toBe("number");
          expect(body.total_count).toBeGreaterThan(body.articles.length);
        });
    });

    test("200 Responds with filtered articles by topic and paginated", () => {
      return request(app)
        .get("/api/articles?topic=mitch&limit=5&p=1")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          body.articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
          expect(typeof body.total_count).toBe("number");
        });
    });

    test("400 Responds with invalid query parameter: sort_by when invalid", () => {
      return request(app)
        .get("/api/articles?sort_by=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("invalid query parameter: sort_by");
        });
    });

    test("200 Responds with sorted, filtered, and paginated articles", () => {
      return request(app)
        .get("/api/articles?author=icellusedkars&topic=mitch&sort_by=title&order=asc&limit=3&p=1")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles.length).toBeLessThanOrEqual(3);
          body.articles.forEach((article) => {
            expect(article.author).toBe("icellusedkars");
            expect(article.topic).toBe("mitch");
          });
        });
    });
  })
  describe("POST", () => {
    test("201: Adds new article and returns it", async () => {
      const newArticle = {
        author: "lurker",
        title: "My new article",
        body: "This is the body of the test article.",
        topic: "cats"
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({body: {article}}) => {
          expect(article).toEqual(expect.objectContaining({
            author: "lurker",
            title: "My new article",
            body: "This is the body of the test article.",
            topic: "cats",
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          }))
        })
    })
    test("400: responds with an error when required fields are missing", async () => {
      const incompleteArticle = {
        author: "lurker",
        title: "No body or topic"
      };

      return request(app)
        .post("/api/articles")
        .send(incompleteArticle)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("Missing required fields");
        })
    })
    test("404: responds with an error for non-existent author", () => {
      const invalidAuthorArticle = {
        author: "non-existent-author",
        title: "Invalid author",
        body: "This is a test",
        topic: "cats"
      };

      return request(app)
        .post("/api/articles")
        .send(invalidAuthorArticle)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("resource not found");
        })
    })
    test("404: responds with an error when topic does not exist", () => {
      const invalidTopicArticle = {
        author: "lurker",
        title: "invalid topic",
        body: "This is a test",
        topic: "not-a-real-topic"
      };

      return request(app)
        .post("/api/articles")
        .send(invalidTopicArticle)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("resource not found");
        })
    })
    test("400: Responds with bad request when fields have incorrect data type", () => {
      const invalidArticle = {
        author: 123,
        title: 123,
        body: 123,
        topic: 123
      }

      return request(app)
        .post("/api/articles")
        .send(invalidArticle)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("Bad request");
        })
    })
    test("201: Newly posted article should have a comment_count of 0", () => {
      const newArticle = {
        author: "icellusedkars",
        title: "Test article",
        body: "This article is a test",
        topic: "paper"
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({body: {article}}) => {
          expect(article.comment_count).toBe(0);
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
          const date = new Date(1604394720000).toISOString;
          expect(article.article_id).toBe(3);
          expect(article.title).toBe("Eight pug gifs that remind me of mitch");
          expect(article.topic).toBe("mitch");
          expect(article.author).toBe("icellusedkars");
          expect(article.body).toBe("some gifs");
          expect(new Date(article.created_at).toISOString).toBe(date);
          expect(article.votes).toBe(5);
          expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
        })
    })
    test("200: Responds with the updated article after decreasing votes", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({inc_votes: -5})
        .expect(200)
        .then(({body: {article}}) => {
          const date = new Date(1604394720000).toISOString;
          expect(article.article_id).toBe(3);
          expect(article.title).toBe("Eight pug gifs that remind me of mitch");
          expect(article.topic).toBe("mitch");
          expect(article.author).toBe("icellusedkars");
          expect(article.body).toBe("some gifs");
          expect(new Date(article.created_at).toISOString).toBe(date);
          expect(article.votes).toBe(-5);
          expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
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
    test("200: Responds with the unchanged article if inc_votes is missing from request", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({})
        .expect(200)
        .then(({body: {article}}) => {
          const date = new Date(1604394720000).toISOString;
          expect(article.article_id).toBe(3);
          expect(article.title).toBe("Eight pug gifs that remind me of mitch");
          expect(article.topic).toBe("mitch");
          expect(article.author).toBe("icellusedkars");
          expect(article.body).toBe("some gifs");
          expect(new Date(article.created_at).toISOString).toBe(date);
          expect(article.votes).toBe(0);
          expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
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
  describe("DELETE", () => {
    test("204: Deletes the article and associated comments", () => {
      const articleToDelete = 1;

      return request(app)
        .delete(`/api/articles/${articleToDelete}`)
        .expect(204)
        .then(() => {
          return request(app)
           .get(`/api/articles/${articleToDelete}`)
           .expect(404);
        })
        .then(() => {
          return db.query(`SELECT * FROM comments WHERE article_id = $1`, [articleToDelete]);
        })
        .then(({rows: comments}) => {
          expect(comments.length).toBe(0);
        })
    })
    test("404: returns 'Article not found' if article does not exist", () => {
      const nonExistentArticleId = 99999;

      return request(app)
        .delete(`/api/articles/${nonExistentArticleId}`)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("Article not found");
        })
    })
    test("400: Returns bad request if invalid article_id", () => {
      const invalidArticleId = "invalid-id";

      return request(app)
        .delete(`/api/articles/${invalidArticleId}`)
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("Invalid article_id");
        })
    })
  })
})

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("200: Responds with an array of 10 comments for the given article_id sorted by most recent first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({body: {comments}}) => {
          expect(Array.isArray(comments)).toBe(true);
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("created_at", {descending: true});

          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
            expect(comment.article_id).toBe(1);
          })
        })
    })
    test("200: Responds with empty array if no comments exist for an article that exists", () => {
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
    test("200: returns 5 comments when limit=5", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(5);
      })
     })
    test("200: returns second page of 3 comments when limit=3&p=2", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments[0].comment_id).toBe(13);
        expect(body.comments[1].comment_id).toBe(7);
        expect(body.comments[2].comment_id).toBe(8);
      })
    })
    test("400: invalid limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=-5")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid limit or page query");
      })
    })
    test("400: invalid page query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid limit or page query");
      })
    })
    test("200: returns empty array when page goes beyond available data", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=10&p=999")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
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
          expect(typeof comment.comment_id).toBe("number");
          expect(comment.author).toBe(testComment.username);
          expect(typeof comment.author).toBe("string");
          expect(comment.body).toBe(testComment.body);
          expect(typeof comment.body).toBe("string");
          expect(comment.article_id).toBe(1);
          expect(typeof comment.article_id).toBe("number");
          expect(comment.votes).toBe(0);
          expect(typeof comment.votes).toBe("number");
          expect(comment).toHaveProperty("created_at");
          expect(new Date(comment.created_at).toString()).not.toBe("Invalid Date");
        })
    })
    test("404: Responds with resource not found if article_id does not exist", () => {
      const testComment = {
        username: "lurker",
        body: "it's ok."
      };

      return request(app)
        .post("/api/articles/999/comments")
        .send(testComment)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("resource not found");
        })
    })
    test("404: Responds with resource not found if username does not exist", () => {
      const testComment = {
        username: "invalidUser",
        body: "hello world"
      }

      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("resource not found");
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
  describe("PATCH", () => {
    test("200: Increments votes by 1 and returns updated comment", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({inc_votes: 1})
        .expect(200)
        .then(({body: {comment}}) => {
          expect(comment).toEqual({
            comment_id: 1,
            article_id: 9,
            body: expect.any(String),
            votes: 17,
            author: "butter_bridge",
            created_at: expect.any(String),
          });
          expect(comment.votes).not.toBe(16);
        })
    })
    test("200: decrements votes by 1 and returns updated comment", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({inc_votes: -1})
        .expect(200)
        .then(({body: {comment}}) => {
          expect(comment).toEqual({
            comment_id: 1,
            article_id: 9,
            body: expect.any(String),
            votes: 15,
            author: "butter_bridge",
            created_at: expect.any(String),
          })
          expect(comment.votes).not.toBe(16);
        })
    })
    test("400: responds with 'Invalid inc_votes value' if inc_votes is not a number", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({inc_votes: "not-a-number"})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("Invalid inc_votes value");
        })
    })
    test("400: responds with bad request for invalid comment_id", () => {
      return request(app)
        .patch("/api/comments/not-a-valid-id")
        .send({inc_votes: 1})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("bad request");
        })
    })
     test("404: responds with 'comment not found' for non-existent comment_id", () => {
      return request(app)
        .patch("/api/comments/999999")
        .send({inc_votes: 1})
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe("comment not found");
        })
     })
     test("400: responds with bad request if inc_votes is missing from request", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({})
        .expect(400)
        .then(({body}) => {
          expect(body.msg).toBe("Invalid inc_votes value");
        })
     })
  })
})