# Architectural Review & Simplification Plan: Drama Engine

## Executive Summary

The Drama Engine (`@write-with-laika/drama-engine`) is a comprehensive framework for agentic interaction, designed with high modularity and extensibility. However, for a specific application focused on OpenRouter integration and streamlined chat, the current architecture introduces significant complexity and abstraction overhead.

This document outlines a plan to "eject" the core valuable components of the Drama Engine into the local codebase, simplify them, and optimize for a single-provider (OpenRouter) architecture.

## Core Components Analysis

### 1. `Drama` (The Orchestrator)
*   **Current State:** Acts as a monolithic singleton manager for database, companions, chats, jobs, and world state. It handles initialization, triggers, and the main loop.
*   **Critique:** Too heavy. Mixing database management, job scheduling, and high-level logic makes it hard to test and reason about.
*   **Simplification:**
    *   Decompose into smaller hooks or service classes.
    *   Remove the "Job" queue system if we are only doing direct request-response (unless we need async background tasks).
    *   Remove the `init` pattern with side effects. Use React Context or standard Dependency Injection for state.

### 2. `Chat` & `ChatMessage`
*   **Current State:** Manages history, context, and speaker selection. Tightly coupled to `Drama` and `AutoCompanion`.
*   **Critique:** Valid abstraction, but the `speakerSelection` logic (Round Robin, Auto, Random) and "Moderator" concept adds complexity not needed for simple 1-on-1 or simple group chats.
*   **Simplification:**
    *   Keep `Chat` as a data structure (or just use `Message[]`).
    *   Extract "Speaker Selection" into a pure function.
    *   Remove `ModeratorDeputy` complexity unless we need an AI moderator explicitly.

### 3. `Prompter` & `Model`
*   **Current State:** `Prompter` uses Jinja templates to render prompts. `Model` handles API calls, token counting, and job execution.
*   **Critique:** `Prompter` is powerful but maybe overkill if we just use standard ChatML/OpenAI API formats. `Model` is an abstraction over `fetch` that tries to be provider-agnostic.
*   **Simplification:**
    *   **Eliminate `Model` class:** Replace with a lightweight `OpenRouterService` client.
    *   **Simplify `Prompter`:** Use standard array-of-objects (`{ role, content }`) format directly supported by OpenRouter/OpenAI APIs. Remove Jinja dependency if possible.

### 4. `Companion` & `AutoCompanion`
*   **Current State:** heavy classes with internal state (mood, status), triggers, and reply registration.
*   **Critique:** Inheritance hierarchy (`Companion` -> `AutoCompanion` -> `Deputy`) is rigid.
*   **Simplification:**
    *   Convert `Companion` to a plain configuration object / Type.
    *   Move logic (reply generation, state updates) to functional helpers or hooks (e.g., `useCompanionReply`).

### 5. `Database` & `InMemoryDatabase`
*   **Current State:** Abstract interface for storage.
*   **Critique:** Good for portability, but if we only need local storage or session storage, we can simplify.
*   **Simplification:**
    *   Use a simple `useLocalStorage` hook or a lightweight store (Zustand/Jotai) instead of a custom DB adapter pattern.

## Simplification Roadmap (Merge Strategy)

The goal is to move from a "Library Framework" to a "Application Architecture".

### Phase 1: Ejection & Localisation
1.  **Copy Core Types:** Create `src/lib/types.ts` defining `Message`, `Companion`, `Chat`.
2.  **Create Service Layer:** Create `src/lib/openrouter.ts` to handle API calls (replacing `Model` and `httpClient`).
3.  **Re-implement Chat Loop:** Create a React Hook `useChatLoop` that handles sending messages and receiving replies, replacing `Drama.runConversation`.

### Phase 2: Refactoring Components
1.  **`Prompter` Replacement:** Implement `buildContext(history, companion)` function that returns the messages array for the API.
2.  **`Companion` Flattening:** Define companions as JSON objects in `src/config/companions.ts` without class instantiation.

### Phase 3: Removal of Dependency
1.  Remove `@write-with-laika/drama-engine` from `package.json`.
2.  Refactor `DramaContext` to be a simple `ChatContext` that holds the current conversation state.

## Arguments for this Approach

1.  **Reduced Bundle Size:** Removing Jinja and unused logic (Deputies, complex Job queues) will significantly lower KB.
2.  **Debuggability:** No black-box library logic. You can step through `useChatLoop` directly in DevTools.
3.  **Flexibility:** You are no longer bound by the `Drama` class lifecycle. You can trigger replies whenever you want (e.g., on specific UI events).
4.  **OpenRouter Optimisation:** We can leverage OpenRouter-specific features (like `models` parameter, `transforms`) directly without fighting a generic abstraction layer.

## Immediate Action Items

- [ ] Create `src/lib/drama/` directory to house ejected logic.
- [ ] Implement `src/lib/drama/types.ts`.
- [ ] Implement `src/lib/drama/OpenRouterClient.ts`.
- [ ] Refactor `DramaContext` to use the new local logic instead of the library.
