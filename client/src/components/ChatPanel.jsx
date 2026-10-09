const steps = [
  'Extract information from text and documents',
  'Inspect target Community Services schema',
  'Map extracted facts with evidence tracking',
  'Flag missing fields and ambiguous data',
  'Require human review before any final action'
];

const aiBadgeClasses = {
  connected: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  fallback: 'border-amber-300 bg-amber-100 text-amber-800',
  error: 'border-red-300 bg-red-100 text-red-800'
};

export default function ChatPanel({ status, result, error }) {
  const plan = result?.plan;
  const extracted = result?.extracted;
  const model = plan?.model;

  let aiStatusBadge = null;
  if (model) {
    if (model.status === 'connected') {
      aiStatusBadge = { label: `Gemma connected (${model.model})`, variant: 'connected' };
    } else if (model.status === 'not-configured') {
      aiStatusBadge = { label: 'Using fallback (Gemma key not set)', variant: 'fallback' };
    } else {
      aiStatusBadge = { label: 'Using fallback (AI call failed)', variant: 'error' };
    }
  }

  const missingFields = plan?.missingFields ?? [];
  const ambiguities = plan?.ambiguities ?? [];
  const questionsCount = missingFields.length + ambiguities.length;

  return (
    <aside
      className="rounded-lg border border-[#1c525b29] bg-white p-5 shadow-[0_20px_60px_rgba(7,37,49,0.12)]"
      aria-label="Workflow and Analysis Results"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-[#1b7f79]">Analysis & Guidance</p>
          <h2 className="m-0 text-xl font-bold text-[#16323f]">Guided Completion</h2>
        </div>
        {aiStatusBadge ? (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${aiBadgeClasses[aiStatusBadge.variant]}`}
          >
            {aiStatusBadge.label}
          </span>
        ) : null}
      </div>

      <ol className="my-4 grid gap-3 pl-5">
        {steps.map((step, idx) => {
          const isDone = Boolean(plan && idx <= 3);
          return (
            <li key={step} className={isDone ? 'font-bold text-[#0f766e]' : 'text-[#334e5a]'}>
              {isDone ? <span className="mr-2 font-black text-[#0f766e]">Done:</span> : null}
              {step}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-1 border-l-4 border-[#0f766e] bg-[#edf8f6] p-3" role="status" aria-live="polite">
        <strong>Status</strong>
        <span>{status}</span>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-red-900">{error}</div> : null}

      {plan ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-950">
            <h3 className="mb-2 text-base font-bold">Summary</h3>
            <p className="m-0 leading-6">{plan.summary}</p>
          </div>

          {questionsCount > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="m-0 text-base font-bold">Action Required ({questionsCount})</h3>
                <span className="inline-block rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  Needs Attention
                </span>
              </div>

              {missingFields.length > 0 ? (
                <div className="mt-3">
                  <h4 className="mb-2 text-sm font-bold uppercase text-amber-800">Missing Required Fields</h4>
                  <ul className="m-0 grid gap-2 pl-5">
                    {missingFields.map((item) => (
                      <li key={item.field}>
                        <strong>{item.label}:</strong> {item.question}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {ambiguities.length > 0 ? (
                <div className="mt-3">
                  <h4 className="mb-2 text-sm font-bold uppercase text-amber-800">Ambiguous Details</h4>
                  <ul className="m-0 grid gap-2 pl-5">
                    {ambiguities.map((item, idx) => (
                      <li key={`${item.field}-${idx}`}>
                        <strong>{item.field}:</strong> {item.question || item.issue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <h3 className="mb-2 text-base font-bold">All Required Fields Provided</h3>
              <p className="m-0">No missing required fields detected. Please review the suggested answers on the right.</p>
            </div>
          )}

          {extracted?.facts &&
          (extracted.facts.email ||
            extracted.facts.phone ||
            extracted.facts.requestedDate ||
            (extracted.files && extracted.files.length > 0)) ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-900">
              <h3 className="mb-2 text-base font-bold">Directly Extracted Facts</h3>
              <dl className="m-0 grid gap-2">
                {extracted.facts.email ? <FactRow label="Email" value={extracted.facts.email} /> : null}
                {extracted.facts.phone ? <FactRow label="Phone" value={extracted.facts.phone} /> : null}
                {extracted.facts.requestedDate ? <FactRow label="Date" value={extracted.facts.requestedDate} /> : null}
                {extracted.files && extracted.files.length > 0 ? (
                  <FactRow label="Documents" value={extracted.files.map((file) => file.originalName).join(', ')} />
                ) : null}
              </dl>
            </div>
          ) : null}

          {extracted?.limitations ? (
            <div className="rounded-md border border-slate-300 bg-slate-100 p-3">
              <p className="m-0 text-sm text-[#60747a]">
                <strong>System Note:</strong> {extracted.limitations.join(' ')}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function FactRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <dt className="min-w-24 font-bold text-slate-600">{label}</dt>
      <dd className="m-0 break-words text-slate-950">{value}</dd>
    </div>
  );
}
