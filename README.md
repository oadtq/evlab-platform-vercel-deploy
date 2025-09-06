<h1 align="center">EveryLab Platform v2</h1>

<p align="center">
    This version is based on Composio integrations. Our roadmap to the final version: Slashy -> Sidekick -> Sola.
</p>

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

```bash
npm run db:generate
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
