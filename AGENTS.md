# Drama Engine Template - Developer Guide

## Project Overview

This project is a Next.js template for building chat applications using the [Drama Engine](https://drama-engine.com). It provides a setup to interact with LLMs (Large Language Models) via a proxy middleware.

## Architecture

### Frontend (`src/app`)

*   **Entry Point**: `src/app/page.tsx` (Server Component) determines the initial configuration. It checks for environment variables and passes them to `src/app/components/HomeClient.tsx` (Client Component).
*   **State Management**: `src/app/contexts/drama-context.tsx` initializes the `Drama` instance and manages the connection.
*   **Components**: Located in `src/app/components/`, these handle the chat UI.

### Middleware (`src/middleware.ts`)

The middleware acts as a proxy for requests to `/v1/completions` and `/v1/chat/completions`.
It intercepts requests from the frontend and forwards them to the configured LLM provider.
It handles authorization by injecting the API key, either from the request headers (client-side config) or from server-side environment variables (server-side config).

## Configuration

The application can be configured in two ways, with **Server-Side Configuration** being the preferred and more secure method.

### 1. Server-Side Configuration (Recommended)

Set these environment variables in your `.env` file or deployment platform (e.g., Vercel). These are **not** exposed to the browser.

*   `DE_BASE_URL`: The base URL of the LLM provider (e.g., `https://openrouter.ai/api`).
*   `DE_BACKEND_API_KEY`: Your API Key for the LLM provider.
*   `DE_ENDPOINT_URL`: The specific endpoint (optional, defaults to `/v1/chat/completions`).

When configured this way, the client receives a placeholder key (`SERVER_MANAGED`), and the actual key is injected by the middleware.

### 2. Client-Side Configuration (Optional)

You can also use `NEXT_PUBLIC_` prefixed variables. These **are** exposed to the browser. Use this only if server-side configuration is not possible.

*   `NEXT_PUBLIC_DE_BASE_URL`
*   `NEXT_PUBLIC_DE_BACKEND_API_KEY`
*   `NEXT_PUBLIC_DE_ENDPOINT_URL`
*   `NEXT_PUBLIC_DE_MODEL_NAME` (To set the default model)

### 3. Manual Configuration

If no environment variables are set, the user will be prompted with a configuration form on the landing page.

## Development

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`
3.  **Linting**: `npm run lint`

## Conventions

*   **State Management**: Use React Context (`DramaContext`) for global state.
*   **Styling**: Tailwind CSS.
*   **Security**: Always prefer server-side environment variables for sensitive keys (`DE_BACKEND_API_KEY`).
