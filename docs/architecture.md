# Form Mitra Architecture

Form Mitra is split into a browser client and an Express backend. The client handles user intake and review-oriented UI. The backend owns extraction, planning, validation, and any future browser automation.

## Client

The client is a Vite React app with a small component structure:

- `Home.jsx` coordinates text/file intake and calls backend APIs.
- `FileUpload.jsx` handles selected PDFs and images.
- `ChatPanel.jsx` shows workflow status, errors, and draft results.
- `FormPreview.jsx` displays synthetic review data.
- `IssueCard.jsx` states the review and missing-information guardrail.
- `services/api.js` centralizes HTTP calls and error parsing.

## Backend

The backend exposes JSON APIs under `/api`.

- `GET /api/health` reports server readiness and selected model-provider label.
- `POST /api/documents/extract` accepts text plus uploaded files. Text extraction is active; PDF/OCR extraction is a future parser boundary.
- `POST /api/agent/plan` creates a guarded draft mapping plan for the demo form.
- `GET /api/forms/demo` returns the synthetic demo form schema.
- `POST /api/forms/validate` validates proposed mappings before any browser action.

## Model Boundary

`server/services/modelService.js` is the only model access boundary. It is designed for an open-weight model provider, such as a local server or a compatible hosted endpoint. No provider-specific key or closed model is hard-coded.

The current implementation intentionally reports that the provider adapter is pending when an endpoint exists. This keeps the project honest until a concrete provider contract is selected.

## Browser Automation Boundary

`server/browser/` is limited to the local synthetic demo form. It must not automate real government, bank, employer, school, healthcare, or immigration forms until the project has explicit permission checks, review UX, audit logging, and domain-specific compliance review.

## Validation Boundary

`server/utils/validators.js` validates field names, empty values, and low-confidence mappings. Future validation should add field-type checks, required-field completeness, normalized dates, and user-confirmed corrections.

## Data Policy

The repository uses synthetic data only. Uploaded documents are ignored by Git and should be treated as private local artifacts. The app should not persist real personal data until there is a clear storage, retention, and deletion policy.
