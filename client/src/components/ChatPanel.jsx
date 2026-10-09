const steps = [
  'Extract information from text and documents',
  'Inspect target Community Services schema',
  'Map extracted facts with evidence tracking',
  'Flag missing fields and ambiguous data',
  'Require human review before any final action'
];

export default function ChatPanel({ status, result, error }) {
  const plan = result?.plan;
  const extracted = result?.extracted;
  const model = plan?.model;

  // Derive honest AI status
  let aiStatusBadge = null;
  if (model) {
    if (model.status === 'connected') {
      aiStatusBadge = {
        label: `✦ Gemma connected (${model.model})`,
        variant: 'connected'
      };
    } else if (model.status === 'not-configured') {
      aiStatusBadge = {
        label: 'Using fallback (Gemma key not set)',
        variant: 'fallback'
      };
    } else {
      aiStatusBadge = {
        label: 'Using fallback (AI call failed)',
        variant: 'error'
      };
    }
  }

  const missingFields = plan?.missingFields ?? [];
  const ambiguities = plan?.ambiguities ?? [];
  const questionsCount = missingFields.length + ambiguities.length;

  return (
    <aside className="workflow-panel" aria-label="Workflow and Analysis Results">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Analysis & Guidance</p>
          <h2>Guided Completion</h2>
        </div>
        {aiStatusBadge && (
          <span className={`ai-badge ai-badge--${aiStatusBadge.variant}`}>
            {aiStatusBadge.label}
          </span>
        )}
      </div>

      {/* Workflow checklist */}
      <ol className="workflow-steps">
        {steps.map((step, idx) => {
          const isDone = Boolean(plan && idx <= 3);
          return (
            <li key={step} className={isDone ? 'step--done' : ''}>
              {isDone && <span className="step-check">✓</span>}
              {step}
            </li>
          );
        })}
      </ol>

      {/* Backend Status Card */}
      <div className="status-card" role="status" aria-live="polite">
        <strong>Status</strong>
        <span>{status}</span>
      </div>

      {/* Error Banner */}
      {error && <div className="error">{error}</div>}

      {/* Result Display — Clean, Polished, Accessible */}
      {plan && (
        <div className="analysis-results">
          {/* Summary Card */}
          <div className="summary-card">
            <h3>Summary</h3>
            <p>{plan.summary}</p>
          </div>

          {/* Missing Required Fields & Questions */}
          {questionsCount > 0 ? (
            <div className="questions-card">
              <div className="questions-header">
                <h3>Action Required ({questionsCount})</h3>
                <span className="badge badge--warning">Needs Attention</span>
              </div>

              {missingFields.length > 0 && (
                <div className="questions-group">
                  <h4>Missing Required Fields</h4>
                  <ul className="questions-list">
                    {missingFields.map((item) => (
                      <li key={item.field}>
                        <strong>{item.label}:</strong> {item.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ambiguities.length > 0 && (
                <div className="questions-group">
                  <h4>Ambiguous Details</h4>
                  <ul className="questions-list">
                    {ambiguities.map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.field}:</strong> {item.question || item.issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="questions-card questions-card--complete">
              <h3>✓ All Required Fields Provided</h3>
              <p>No missing required fields detected. Please review the suggested answers on the right.</p>
            </div>
          )}

          {/* Extracted Facts */}
          {extracted?.facts && (extracted.facts.email || extracted.facts.phone || extracted.facts.requestedDate || (extracted.files && extracted.files.length > 0)) && (
            <div className="facts-card">
              <h3>Directly Extracted Facts</h3>
              <dl className="facts-list">
                {extracted.facts.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>{extracted.facts.email}</dd>
                  </div>
                )}
                {extracted.facts.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{extracted.facts.phone}</dd>
                  </div>
                )}
                {extracted.facts.requestedDate && (
                  <div>
                    <dt>Date</dt>
                    <dd>{extracted.facts.requestedDate}</dd>
                  </div>
                )}
                {extracted.files && extracted.files.length > 0 && (
                  <div>
                    <dt>Documents</dt>
                    <dd>{extracted.files.map((f) => f.originalName).join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* File Processing Limitations */}
          {extracted?.limitations && (
            <div className="limitations-card">
              <p className="hint">
                ℹ️ <strong>System Note:</strong> {extracted.limitations.join(' ')}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
