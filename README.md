# NC News Seeding

Under normal circumstances environment variable files would be kept private, however they are required in order for this project to be accessible locally.

Two files need to be created in the root of the directory:
* .env.development
* .env.test

.env.development should contain:

```
PGDATABASE=nc_news
```

.env.test should contain:

```
PGDATABASE=nc_news_test
```