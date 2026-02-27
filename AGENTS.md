# Drama Engine Template - Developer Guide

## Project Overview

This project is a Next.js template for building chat applications using the [Drama Engine](https://drama-engine.com). It provides a setup to interact with LLMs (Large Language Models) via a proxy middleware.

## Architecture

### Frontend (`src/app`)

*   **Entry Point**: `src/app/page.tsx` handles the initial configuration (API Key, Base URL, etc.). It renders the `AllChatsContainer` wrapped in `DramaProvider` once configured.
*   **Context**: `src/app/contexts/drama-context.tsx` initializes the `Drama` instance from `@write-with-laika/drama-engine`. It manages the connection to the LLM provider.
*   **Components**: located in `src/app/components/`, these handle the chat UI (`AllChatsContainer`, `ChatTabsContainer`, `ChatHistoryContainer`).

### Middleware (`src/middleware.ts`)

The middleware acts as a proxy for requests to `/v1/completions` and `/v1/chat/completions`.
It intercepts requests from the frontend and forwards them to the configured LLM provider (e.g., OpenRouter, Together AI).
**Important**: The middleware is intended to hide API keys from the client, but currently, the client sends them in headers. A more secure approach would be to store keys server-side.

## Configuration

The application can be configured via environment variables or the UI form on the landing page.

### Environment Variables

*   `NEXT_PUBLIC_DE_BASE_URL`: The base URL of the LLM provider (e.g., `https://openrouter.ai/api`).
*   `NEXT_PUBLIC_DE_ENDPOINT_URL`: The specific endpoint (e.g., `/v1/completions`).
*   `NEXT_PUBLIC_DE_BACKEND_API_KEY`: Your API Key for the LLM provider.
*   `NEXT_PUBLIC_DE_MODEL_NAME`: The model to use (e.g., `stepfun/step-3.5-flash:free`).

## Development

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`
3.  **Linting**: `npm run lint`

## Conventions

*   **State Management**: Use React Context (`DramaContext`) for global state related to the drama engine.
*   **Styling**: Tailwind CSS is used for styling.
*   **Client vs Server**: Be mindful of Next.js Server vs Client Components. The `Drama` engine runs on the client, so components interacting with it must be marked `"use client"`.
