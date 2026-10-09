import { useState, useEffect } from 'react';

const PROGRAM_OPTIONS = [
  'Community services',
  'Education support',
  'Healthcare navigation'
];

export default function FormPreview({ result, onSaveReview }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: '',
    requestedDate: '',
    notes: ''
  });

  const [metadata, setMetadata] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  // Sync with plan whenever result updates
  useEffect(() => {
    if (result?.plan?.proposedMappings) {
      const initialData = {
        fullName: '',
        email: '',
        phone: '',
        program: '',
        requestedDate: '',
        notes: ''
      };
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
    } else {
      // Default initial synthetic preview when no analysis has run yet
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
    }
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

  function handleSave(e) {
    e.preventDefault();
    setIsSaved(true);
    if (onSaveReview) {
      onSaveReview(formData);
    }
  }

  const isLive = Boolean(result?.plan);

  return (
    <section className="preview" aria-labelledby="preview-title">
      <div className="preview-header">
        <div>
          <p className="eyebrow">Target Form</p>
          <h2 id="preview-title">Community Services Request</h2>
        </div>
        {isLive ? (
          <span className="badge badge--interactive">Interactive Review</span>
        ) : (
          <span className="badge badge--fixture">Fixture Preview</span>
        )}
      </div>

      <p className="hint">
        {isLive
          ? 'Human review required: review extracted suggestions, edit values, and fill in missing fields below.'
          : 'Synthetic preview for local development. Run Analyze draft to populate with your data.'}
      </p>

      <form className="review-form" onSubmit={handleSave}>
        {/* Full Name */}
        <div className={`review-field ${!formData.fullName ? 'review-field--missing' : ''}`}>
          <div className="review-field-header">
            <label htmlFor="rev-fullName">
              Full name <span className="req">*</span>
            </label>
            <ConfidenceTag meta={metadata.fullName} isValuePresent={Boolean(formData.fullName)} />
          </div>
          <input
            id="rev-fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="e.g. Pavan Kumar"
            required
          />
          <EvidenceSnippet meta={metadata.fullName} />
        </div>

        {/* Email */}
        <div className={`review-field ${!formData.email ? 'review-field--missing' : ''}`}>
          <div className="review-field-header">
            <label htmlFor="rev-email">
              Email <span className="req">*</span>
            </label>
            <ConfidenceTag meta={metadata.email} isValuePresent={Boolean(formData.email)} />
          </div>
          <input
            id="rev-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. applicant@example.com"
            required
          />
          <EvidenceSnippet meta={metadata.email} />
        </div>

        {/* Phone */}
        <div className="review-field">
          <div className="review-field-header">
            <label htmlFor="rev-phone">Phone (Optional)</label>
            <ConfidenceTag meta={metadata.phone} isValuePresent={Boolean(formData.phone)} optional />
          </div>
          <input
            id="rev-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g. +1-555-0199"
          />
          <EvidenceSnippet meta={metadata.phone} />
        </div>

        {/* Program */}
        <div className={`review-field ${!formData.program ? 'review-field--missing' : ''}`}>
          <div className="review-field-header">
            <label htmlFor="rev-program">
              Program <span className="req">*</span>
            </label>
            <ConfidenceTag meta={metadata.program} isValuePresent={Boolean(formData.program)} />
          </div>
          <select
            id="rev-program"
            value={formData.program}
            onChange={(e) => handleChange('program', e.target.value)}
            required
          >
            <option value="">Select a program...</option>
            {PROGRAM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <EvidenceSnippet meta={metadata.program} />
        </div>

        {/* Requested Date */}
        <div className={`review-field ${!formData.requestedDate ? 'review-field--missing' : ''}`}>
          <div className="review-field-header">
            <label htmlFor="rev-requestedDate">
              Requested date <span className="req">*</span>
            </label>
            <ConfidenceTag meta={metadata.requestedDate} isValuePresent={Boolean(formData.requestedDate)} />
          </div>
          <input
            id="rev-requestedDate"
            type="date"
            value={formData.requestedDate}
            onChange={(e) => handleChange('requestedDate', e.target.value)}
            required
          />
          <EvidenceSnippet meta={metadata.requestedDate} />
        </div>

        {/* Additional Notes */}
        <div className="review-field review-field--full">
          <div className="review-field-header">
            <label htmlFor="rev-notes">Additional notes</label>
            <ConfidenceTag meta={metadata.notes} isValuePresent={Boolean(formData.notes)} optional />
          </div>
          <textarea
            id="rev-notes"
            rows="3"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional accommodation, request, or background details..."
          />
          <EvidenceSnippet meta={metadata.notes} />
        </div>

        <div className="review-actions">
          <button type="submit" className="button--secondary">
            {isSaved ? '✓ Review confirmed' : 'Confirm & Validate Review'}
          </button>
          <span className="safety-note">
            🛡️ Guardrail: Entries are held for human confirmation only. No automated external submission is performed.
          </span>
        </div>
      </form>
    </section>
  );
}

function ConfidenceTag({ meta, isValuePresent, optional = false }) {
  if (!isValuePresent) {
    if (optional) return <span className="tag field-badge tag--muted">Optional</span>;
    return <span className="tag field-badge tag--missing">Missing required</span>;
  }

  if (meta?.userEdited) {
    return <span className="tag field-badge tag--user">User confirmed</span>;
  }

  const confidence = Number(meta?.confidence ?? 0);
  if (confidence >= 0.8) {
    return <span className="tag field-badge tag--high">High confidence ({Math.round(confidence * 100)}%)</span>;
  }
  return <span className="tag field-badge tag--review">Needs review ({Math.round(confidence * 100)}%)</span>;
}

function EvidenceSnippet({ meta }) {
  if (!meta) return null;
  return (
    <div className="evidence-container">
      {meta.source && (
        <span className="evidence-text">
          <strong>Source:</strong> &ldquo;{meta.source}&rdquo;
        </span>
      )}
      {meta.reasoning && (
        <span className="evidence-reasoning">{meta.reasoning}</span>
      )}
    </div>
  );
}
