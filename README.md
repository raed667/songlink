# [songlink.cc](https://www.songlink.cc/?s=github)

Share your favorite song, album or artist with your friends without worrying about which music streaming service they use.

### Why songlink.cc?

Besides the obvious _why not_ answer. I wanted to create a simple tool to share music with my friends across different platforms.

I wanted to build this tool to avoid lock-in, and to make it easier to share music without having to remember which platform each person uses.

### Deploy your own instance

SongLink is a Next.js application, Postgres is used a DB and Redis as cache. Provide required keys and ids in the `.env` then run locally using `npm dev`.

SongLink is currently deployed on Vercel free tier, but can deployed on any environment.

### What data do you store?

I store the links you generate, the source and target platforms. I do not store any personal information.

### Logging

The project uses [Axiom](https://axiom.co/docs/get-help/faq) as a log management and analytics solution.

## Integrations

You can submit a link through the API, this can be used to integrate SongLink with 3rd party applications, macros and shortcuts.

An optional `details=true` parameter can be passed to get more information back.

```bash
## Query
$ curl 'https://songlink.cc/link?link=https%3A%2F%2Fdeezer.page.link%2FkFQz1xRvX5F2vKLP8'

## Response
{
    "status": "success",
    "songLink": "https://songlink.cc/artist/deezer_artist_2471"
}
```

## License

[MIT](LICENSE)
