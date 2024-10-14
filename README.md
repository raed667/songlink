# [songlink.cc](https://www.songlink.cc/?s=github) 

Share your favorite song, album or artist with your friends without worrying about which music streaming service they use.

### Why songlink.cc?

Besides the obvious *why not* answer. I wanted to create a simple tool to share music with my friends across different platforms.

I wanted to build this tool to avoid lock-in, and to make it easier to share music without having to remember which platform each person uses.

### Deploy your own instance

SongLink is a Next.js application, Postgres is used a DB and Redis as cache. Provide required keys and ids in the `.env` then run locally using `npm dev`. 

SongLink is currently deployed on Vercel free tier, but can deployed on any envrionmenet. 

### What data do you store?

I store the links you generate, the source and target platforms. I do not store any personal information.

### Logging 

The project uses [Axiom](https://axiom.co/docs/get-help/faq) as a log management and analytics solution.

## License

[MIT](LICENSE)
