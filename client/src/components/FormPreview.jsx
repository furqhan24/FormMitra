import { useEffect, useState } from 'react';

const PROGRAM_OPTIONS = ['Community services', 'Education support', 'Healthcare navigation'];

const emptyFormData = {
  fullName: '',
  email: '',
  phone: '',
  program: '',
  requestedDate: '',
  notes: ''
};

export default function FormPreview({ result, onSaveReview }) {
  const [formData, setFormData] = useState(emptyFormData);
  const [metadata, setMetadata] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (result?.plan?.proposedMappings) {
      const initialData = { ...emptyFormData };
      const initialMeta = {};

      result.plan.proposedMappings.forEach((mapping) => {
        if (mapping.field in initialData) {
          initialData[mapping.field] = mapping.value || '';
          initialMeta[mapping.field] = {
            confidence: mapping.confidence,
            source: mapping.source,
            reasoning: mapping.reasoning,
            userEdited: false
          };
        }
      });

      setFormData(initialData);
      setMetadata(initialMeta);
      setIsSaved(false);
      return;
    }

    setFormData({
      fullName: 'Asha Sharma',
      email: 'asha@example.test',
      phone: '+1-555-0199',
      program: 'Community services',
      requestedDate: '2026-10-15',
      notes: 'Wheelchair access assistance requested.'
    });
    setMetadata({
      fullName: { confidence: 1.0, source: 'synthetic-fixture' },
      email: { confidence: 1.0, source: 'synthetic-fixture' },
      program: { confidence: 1.0, source: 'synthetic-fixture' },
      requestedDate: { confidence: 1.0, source: 'synthetic-fixture' }
    });
  }, [result]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMetadata((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        confidence: 1.0,
        source: 'user-confirmed',
        userEdited: true
      }
    }));
    setIsSaved(false);
  }

  function handleSave(event) {
    event.preventDefault();
    setIsSaved(true);
    onSaveReview?.(formData);
  }

  const isLive = Boolean(result?.plan);

  return (
    <section
      className="rounded-lg border border-[#1c525b29] bg-white p-5 shadow-[0_20px_60px_rgba(7,37,49,0.12)]"
      aria-labelledby="preview-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-[#1b7f79]">Target Form</p>
          <h2 id="preview-title" className="m-0 text-xl font-bold text-[#16323f]">
            Community Services Request
          </h2>
        </div>
        {isLive ? (
          <span className="inline-block rounded-md bg-teal-100 px-2 py-1 text-xs font-bold text-[#0f766e]">
            Interactive Review
          </span>
        ) : (
          <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
            Fixture Preview
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-[#60747a]">
        {isLive
          ? 'Human review required: review extracted suggestions, edit values, and fill in missing fields below.'
          : 'Synthetic preview for local development. Run Analyze draft to populate with your data.'}
      </p>

      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
        <ReviewInput
          id="rev-fullName"
          label="Full name"
          required
          value={formData.fullName}
          placeholder="e.g. Pavan Kumar"
          meta={metadata.fullName}
          onChange={(value) => handleChange('fullName', value)}
        />

        <ReviewInput
          id="rev-email"
          label="Email"
          required
          type="email"
          value={formData.email}
          placeholder="e.g. applicant@example.com"
          meta={metadata.email}
          onChange={(value) => handleChange('email', value)}
        />

        <ReviewInput
          id="rev-phone"
          label="Phone (Optional)"
          type="tel"
          value={formData.phone}
          placeholder="e.g. +1-555-0199"
          meta={metadata.phone}
          optional
          onChange={(value) => handleChange('phone', value)}
        />

        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="rev-program" className="text-sm font-extrabold text-[#183946]">
              Program <RequiredMark />
            </label>
            <ConfidenceTag meta={metadata.program} isValuePresent={Boolean(formData.program)} />
          </div>
          <select
            id="rev-program"
            value={formData.program}
            onChange={(event) => handleChange('program', event.target.value)}
            required
            className={inputClass(!formData.program)}
          >
            <option value="">Select a program...</option>
            {PROGRAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <EvidenceSnippet meta={metadata.program} />
        </div>

        <ReviewInput
          id="rev-requestedDate"
          label="Requested date"
          required
          type="date"
          value={formData.requestedDate}
          meta={metadata.requestedDate}
          onChange={(value) => handleChange('requestedDate', value)}
        />

        <div className="grid gap-1 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="rev-notes" className="text-sm font-extrabold text-[#183946]">
              Additional notes
            </label>
            <ConfidenceTag meta={metadata.notes} isValuePresent={Boolean(formData.notes)} optional />
          </div>
          <textarea
            id="rev-notes"
            rows="3"
            value={formData.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            placeholder="Any additional accommodation, request, or background details..."
            className="w-full rounded-md border border-[#bdd4d2] bg-white p-3 text-sm text-[#16323f]"
          />
          <EvidenceSnippet meta={metadata.notes} />
        </div>

        <div className="grid gap-3 border-t border-slate-200 pt-4 md:col-span-2">
          <button
            type="submit"
            className="min-h-12 rounded-md bg-[#0f766e] px-5 py-3 font-extrabold text-white transition hover:bg-[#0b5f59]"
          >
            {isSaved ? 'Review confirmed' : 'Confirm & Validate Review'}
          </button>
          <span className="text-sm leading-6 text-slate-500">
            Guardrail: Entries are held for human confirmation only. No automated external submission is performed.
          </span>
        </div>
      </form>
    </section>
  );
}

function ReviewInput({ id, label, type = 'text', required = false, value, placeholder, meta, optional = false, onChange }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-extrabold text-[#183946]">
          {label} {required ? <RequiredMark /> : null}
        </label>
        <ConfidenceTag meta={meta} isValuePresent={Boolean(value)} optional={optional} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass(required && !value)}
      />
      <EvidenceSnippet meta={meta} />
    </div>
  );
}

function RequiredMark() {
  return <span className="font-black text-red-600">*</span>;
}

function inputClass(isMissing) {
  return `w-full rounded-md border p-3 text-sm text-[#16323f] ${
    isMissing ? 'border-red-300 bg-red-50' : 'border-[#bdd4d2] bg-white'
  }`;
}

function ConfidenceTag({ meta, isValuePresent, optional = false }) {
  if (!isValuePresent) {
    if (optional) {
      return <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Optional</span>;
    }
    return <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Missing required</span>;
  }

  if (meta?.userEdited) {
    return <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">User confirmed</span>;
  }

  const confidence = Number(meta?.confidence ?? 0);
  if (confidence >= 0.8) {
    return (
      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
        High confidence ({Math.round(confidence * 100)}%)
      </span>
    );
  }

  return (
    <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
      Needs review ({Math.round(confidence * 100)}%)
    </span>
  );
}

function EvidenceSnippet({ meta }) {
  if (!meta) return null;

  return (
    <div className="mt-1 grid gap-0.5 text-xs leading-5">
      {meta.source ? (
        <span className="text-[#0f766e]">
          <strong>Source:</strong> &ldquo;{meta.source}&rdquo;
        </span>
      ) : null}
      {meta.reasoning ? <span className="italic text-slate-500">{meta.reasoning}</span> : null}
    </div>
  );
}
