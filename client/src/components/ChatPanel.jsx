const steps = [
  'Extract information from text and documents',
  'Inspect the target form fields',
  'Map extracted facts to validated fields',
  'Fill only the controlled demo form',
  'Flag missing data and validation issues',
  'Require user review before any final submission'
];

export default function ChatPanel({ status, result, error }) {
  return (
    <aside className="workflow-panel" aria-label="Workflow status">
      <div>
        <p className="eyebrow">Workflow</p>
        <h2>Guided form completion</h2>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="status-card" role="status" aria-live="polite">
        <strong>Status</strong>
        <span>{status}</span>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <pre className="result-preview">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </aside>
  );
}
