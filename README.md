# Auto Inspector

An autonomous AI agent that tests web applications based on user stories. Write what you want to test in plain language — the agent navigates the browser, interacts with the UI, and reports results.

> Built from scratch. Inspired by the concepts of [auto-inspector](https://github.com/magic-inspector/auto-inspector) by Magic Inspector, but written as an independent project with a new architecture (MySQL, Socket.IO, multi-LLM support, REST API).

---

## How it works

1. You define **scenarios** — a set of variables (credentials, URLs, data) and test cases written as user stories
2. The **Manager Agent** takes a screenshot, reads the DOM, and decides the next action (click, fill input, scroll, navigate, etc.)
3. The **Evaluation Agent** verifies whether the test passed or failed
4. Results are saved to the database and emitted via Socket.IO in real time

---

## LLM Providers

| Provider | `LLM_PROVIDER` value | Notes |
|---|---|---|
| OpenAI GPT-4o | `openai` | Requires `OPENAI_API_KEY` |
| Google Gemini 2.5 Flash | `gemini` | Requires `GOOGLE_API_KEY` |
| Ollama (local) | `ollama` | Requires a vision-capable model running locally |

---

## Getting Started

### Prerequisites
- Docker + Docker Compose
- API key for your chosen LLM provider

### Setup

```bash
git clone <your-repo>
cd auto-inspector

cp .env.example .env
# Edit .env with your keys and DB credentials

make dev-up
```

Services after start:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- MySQL: localhost:3306

---

## REST API

### Scenarios
```
GET    /scenarios            List all saved scenarios
POST   /scenarios            Create a scenario
GET    /scenarios/:id        Get a scenario
PUT    /scenarios/:id        Update a scenario
DELETE /scenarios/:id        Delete a scenario
POST   /scenarios/:id/run    Run a saved scenario
```

### Runs
```
POST   /runs        Run an inline scenario payload
GET    /runs        List all runs with results
GET    /runs/:id    Get run details
DELETE /runs/:id    Delete a run
```

### Socket.IO Events (real-time progress)
```
test:started          { runId, totalCases }
test:case:started     { runId, caseIndex, userStory }
test:case:completed   { runId, caseIndex, passed, reason, durationMs }
test:finished         { runId, summary: { passed, failed, total } }
test:error            { runId, error }
```

---

## Scenario Format

```json
{
  "context": {
    "variables": [
      { "name": "login_url", "value": "https://your-app.com/login", "is_secret": false },
      { "name": "email", "value": "user@example.com", "is_secret": false },
      { "name": "password", "value": "secret", "is_secret": true }
    ]
  },
  "cases": [
    {
      "start_url": "{{login_url}}",
      "user_story": "As a user I can log in with {{email}} and {{password}} and see the dashboard."
    }
  ]
}
```

---

## CLI

```bash
cd backend

# Run a specific scenario file
npm run scenario -- --file=../examples/passing-cases.json

# Run the default example
npm run example:file
```

---

## Project Structure

```
backend/             NestJS API (agents, TypeORM entities, Socket.IO gateway)
frontend/            SvelteKit UI
playwright-server/   Headless Playwright browser exposed via WebSocket
examples/            Example scenario JSON files
```

---

## License

Apache 2.0 — see [LICENCE](LICENCE)
