# NC News

The NC News API is a RESTful API designed for managing articles and comments in a mock backend service (like Reddit) where users can post articles on various topics and other users can post comments on the article as well as having the ability to upvote or downvote the article.

You can find more details about available endpoints for the API in the [endpoints.json](./endpoints.json) file.

This project uses **Node.js**, **Express**, and **PostgreSQL**, and has been built following **Test-Driven Development (TDD)** using **Jest** and **Supertest**.

### Hosted version:
You can check out a live hosted version of this API [here](https://nc-news-w4kh.onrender.com/api/).

It may take a minute to load initially as it is hosted on render with a free plan.

## Instructions for a local installation:

### Prerequisites:
- Node.js (v23.3.0 or higher)
- PostgreSQL (v16.8 or higher)

[![Node.js](https://img.shields.io/badge/Node.js-v23.3.0-green)](https://nodejs.org/) 
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.8-green)](https://www.postgresql.org/)

### Clone the repository
```
git clone https://github.com/RafalbCzajka/nc-news.git
```

### Install Dependencies
```
npm install
```

### Create Environment Variable files
Under normal circumstances environment variable files would be kept private, however they are required in order for this project to be accessible locally.

Two files need to be created in the root of the directory:
* `.env.development`
* `.env.test`

`.env.development` should contain:

```
PGDATABASE=nc_news
```

`.env.test` should contain:

```
PGDATABASE=nc_news_test
```

### Run scripts to set up local development and testing databases

First run the `setup-dbs` script which will create two databases, `nc_news` for development, and `nc_news_test` for testing.
```
npm run setup-dbs
```
Then run the `seed-dev` script to seed the newly created development database with mock data.
```
npm run seed-dev
```
`nc_news_test` is re-seeded before each test is run in jest.

## How to run tests

There are three test files included in the project:
- `app.test.js` - For testing the express application.
- `seed.test.js` - For testing the seeding of the database.
- `utils.test.js` - For testing utility functions used throughout the project.

To run all tests:
```
npm test
```

To run an individual test file:
```
npm test app.test.js
```
`app.test.js` can be replaced with any of the other test files.