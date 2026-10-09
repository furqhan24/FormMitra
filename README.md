# Form Mitra

Form Mitra is an early foundation for an AI-assisted form-filling agent. It accepts natural-language text and selected documents, extracts available information, prepares guarded field mappings for a controlled demo form, and keeps user review as a required step.

This repository currently contains a React + Vite client and a Node.js + Express backend. The model provider is configurable and expected to be an open-weight model endpoint, but the provider adapter is intentionally not wired until a concrete local or hosted open-weight endpoint is chosen.

## Current Features

- React homepage branded Form Mitra.
- Text input and file selection for PDFs and images.
- Centralized frontend API service with loading and error states.
- Express `GET /api/health` endpoint.
- Document extraction module with text extraction active.
- Placeholder metadata handling for uploaded PDF/image files.
- Guarded agent planning structure with validation of demo-form field mappings.
- Synthetic demo form fixture in `data/demo-form/index.html`.
- Browser automation and accessibility modules scaffolded for the controlled demo form only.

## Requirements

- Node.js 20 or newer.
- npm.

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd` in the commands below.

## Setup

Install dependencies:

```bash
npm install --prefix client
npm install --prefix server
```

Create backend environment configuration:

```bash
copy server\.env.example server\.env
```

Start the backend:

```bash
npm run dev --prefix server
```

Start the frontend in another terminal:

```bash
npm run dev --prefix client
```

The frontend defaults to `http://localhost:5173`, and the backend defaults to `http://localhost:4000`.

## Environment Variables

Backend variables live in `server/.env`:

- `PORT`: Express port. Defaults to `4000`.
- `CLIENT_ORIGIN`: Allowed client origin for CORS. Defaults to `http://localhost:5173`.
- `MODEL_PROVIDER`: Label for the selected open-weight provider.
- `MODEL_ENDPOINT`: Local or hosted model endpoint.
- `MODEL_NAME`: Model name, such as a local Llama-family model.
- `ENABLE_DEMO_BROWSER_AUTOMATION`: Must remain `false` unless demo-only automation is intentionally enabled later.

Do not commit `.env` files, private uploads, browser profiles, authentication state, or real user documents.

## Architecture

- `client/`: React + Vite application.
- `client/src/services/api.js`: Central frontend HTTP client.
- `server/server.js`: Express app setup, health route, route mounting, and JSON error handling.
- `server/routes/`: API route modules.
- `server/services/`: document extraction, model access, and form inspection boundaries.
- `server/agent/`: planning prompt and mapping logic.
- `server/browser/`: Playwright automation boundary for the demo form.
- `server/accessibility/`: future `@axe-core/playwright` scanning boundary.
- `server/utils/`: backend validators.
- `data/demo-form/`: synthetic local form fixture.
- `docs/architecture.md`: architecture notes and safety boundaries.

## Safety Boundaries

- Form Mitra must never invent missing personal information.
- Real consequential submissions are out of scope.
- Browser automation is restricted to the controlled demo form for now.
- CAPTCHA, OTP, login, authentication, and website restrictions must not be bypassed.
- Model-generated mappings must be validated before any browser action.
- Users must review completed forms before submission.

## Current Limitations

- PDF parsing and image OCR are not implemented.
- The model provider adapter returns a clear not-configured or not-called response.
- Playwright form filling is scaffolded but not active.
- Accessibility scanning is scaffolded but not wired to a live browser page.
- No database, authentication, vector store, or RAG pipeline is included.

##  Future Steps

Build one complete demo workflow: inspect `data/demo-form/index.html`, map synthetic text to its required fields, show missing-field questions, let the user answer them, fill the local demo form with Playwright, run an axe scan, and render a review screen before any final action.
