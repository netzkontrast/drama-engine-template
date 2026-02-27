# Drama Engine Template - Developer Guide

## Project Overview

This project is a Next.js template for building chat applications using the [Drama Engine](https://drama-engine.com). It is pre-configured to work with **OpenRouter**.

## Architecture

### Frontend (`src/app`)

*   **Entry Point**: `src/app/page.tsx` (Server Component) determines if the API Key is configured. It passes the status to `src/app/components/HomeClient.tsx`.
*   **State Management**: `src/app/contexts/drama-context.tsx` initializes the `Drama` instance and manages the connection to OpenRouter.
*   **Components**: Located in `src/app/components/`, these handle the chat UI.

### Middleware (`src/middleware.ts`)

The middleware acts as a proxy for requests to `/v1/chat/completions`.
It intercepts requests from the frontend and forwards them to OpenRouter (`https://openrouter.ai/api`).
It handles authorization by injecting the API key, either from the request headers (client-side input) or from server-side environment variables (server-side config).

## Configuration

This application only requires one environment variable: `DE_BACKEND_API_KEY`.

### 1. Server-Side Configuration (Recommended)

Set the `DE_BACKEND_API_KEY` in your `.env` file or deployment platform (e.g., Vercel). This key is **not** exposed to the browser.

```bash
DE_BACKEND_API_KEY=sk-or-your-openrouter-key
```

When configured this way, the client receives a placeholder key (`SERVER_MANAGED`), and the actual key is injected by the middleware.

### 2. Manual Configuration

If `DE_BACKEND_API_KEY` is not set, the user will be prompted to enter an API key on the landing page.

## Development

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`
3.  **Linting**: `npm run lint`

## Conventions

*   **Provider**: Hardcoded to OpenRouter.
*   **State Management**: Use React Context (`DramaContext`) for global state.
*   **Styling**: Tailwind CSS.
*   **Security**: Always prefer server-side environment variables for sensitive keys (`DE_BACKEND_API_KEY`).
