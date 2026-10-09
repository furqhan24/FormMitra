import { useEffect, useState } from 'react';
import ChatPanel from '../components/ChatPanel.jsx';
import FileUpload from '../components/FileUpload.jsx';
import FormPreview from '../components/FormPreview.jsx';
import IssueCard from '../components/IssueCard.jsx';
import { createPlan, extractDocument, getHealth } from '../services/api.js';

const SAMPLES = [
  {
    label: 'Complete Info (Pavan Kumar)',
    text: 'My name is Pavan Kumar. My email is pavan@example.com. I want to request the community support program on 2026-11-15.'
  },
  {
    label: 'Ambiguous Single Word ("pavan")',
    text: 'pavan'
  },
  {
    label: 'Missing Fields (Assistance request)',
    text: 'I need assistance. I have not provided my email or requested date.'
  }
];

export default function Home() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('Checking backend health...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getHealth()
      .then((payload) => {
        const provider = payload.modelProvider ?? 'google-gemma';
        setStatus(`Backend online: ${payload.service} (${provider})`);
      })
      .catch((err) => setStatus(`Backend unavailable: ${err.message}`));
  }, []);

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setStatus('Extracting supplied information...');

    try {
      const extracted = await extractDocument({ text, files });
      setStatus('Analyzing with Gemma and checking form schema...');
      const plan = await createPlan({ extracted });
      setResult({ extracted, plan });
      setStatus(plan.validation.valid ? 'Ready for final review' : 'Action needed: review missing or ambiguous fields');
    } catch (err) {
      setError(err.message);
      setStatus('Needs attention');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveReview(reviewedData) {
    setStatus('Review confirmed by applicant. Ready for subsequent action.');
  }

  function handleSelectSample(sampleText) {
    setText(sampleText);
    setError('');
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">AI-assisted form filling</p>
          <h1 id="page-title">Form Mitra</h1>
          <p>
            An intelligent, guarded assistant for extracting facts, mapping Community Services fields, flagging
            ambiguity, and keeping humans in control before any submission.
          </p>
        </div>
        <form className="intake-panel" onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="label-with-samples">
              <label htmlFor="user-text">Known information</label>
            </div>
            <div className="samples-toolbar" aria-label="Synthetic sample inputs">
              <span className="samples-hint">Quick test:</span>
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-pill"
                  onClick={() => handleSelectSample(s.text)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              id="user-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste applicant details or select a sample above..."
              rows="6"
            />
          </div>
          <FileUpload files={files} onFilesChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} />
          <button type="submit" disabled={isLoading || (!text.trim() && files.length === 0)}>
            {isLoading ? 'Analyzing with Gemma...' : 'Analyze draft'}
          </button>
        </form>
      </section>

      <section className="content-grid">
        <ChatPanel status={status} result={result} error={error} />
        <div className="stack">
          <FormPreview result={result} onSaveReview={handleSaveReview} />
          <IssueCard />
        </div>
      </section>
    </main>
  );
}
