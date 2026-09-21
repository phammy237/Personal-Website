This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contact form configuration

Set `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in the server environment. The Redis token needs permission to run EVAL, GET, INCR, EXPIRE, and TTL. See the [Upstash REST API setup](https://upstash.com/docs/redis/features/restapi). Never expose these secrets with a `NEXT_PUBLIC_` prefix.

The contact endpoint reserves a shared quota before sending: at most 20 send attempts per hour across all callers and server instances. Failed email attempts also consume quota. This global ceiling cannot be bypassed by changing IP headers or contact details; it can temporarily block legitimate messages during abuse. A filled honeypot is silently discarded. Over-quota requests return 429 with Retry-After. Missing or unavailable Redis returns 503 without sending email in production. Development and tests use an in-memory quota when Redis is not configured.

Request bodies are limited to 32 KiB; name/contact/subject/message limits are 100/254/200/5000 characters. Contact accepts email or phone text. Malformed JSON, non-string fields, blank required fields, and excessive lengths return 400.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
