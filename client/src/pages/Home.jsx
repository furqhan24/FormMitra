import { useEffect, useState } from 'react';
import ChatPanel from '../components/ChatPanel.jsx';
import FileUpload from '../components/FileUpload.jsx';
import FormPreview from '../components/FormPreview.jsx';
import IssueCard from '../components/IssueCard.jsx';
import { createPlan, extractDocument, getHealth } from '../services/api.js';

export default function Home() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('Checking backend health...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getHealth()
      .then((payload) => setStatus(`Backend online: ${payload.service}`))
      .catch((err) => setStatus(`Backend unavailable: ${err.message}`));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setStatus('Extracting supplied information...');

    try {
      const extracted = await extractDocument({ text, files });
      setStatus('Creating guarded field mapping plan...');
      const plan = await createPlan({ extracted });
      setResult({ extracted, plan });
      setStatus('Ready for review');
    } catch (err) {
      setError(err.message);
      setStatus('Needs attention');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">AI-assisted form filling</p>
          <h1 id="page-title">Form Mitra</h1>
          <p>
            A careful assistant foundation for extracting facts, mapping fields, resolving issues, and keeping humans
            in control before submission.
          </p>
        </div>
        <form className="intake-panel" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="user-text">Known information</label>
            <textarea
              id="user-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste synthetic applicant details or instructions here."
              rows="8"
            />
          </div>
          <FileUpload files={files} onFilesChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} />
          <button type="submit" disabled={isLoading || (!text.trim() && files.length === 0)}>
            {isLoading ? 'Working...' : 'Analyze draft'}
          </button>
        </form>
      </section>
      <section className="content-grid">
        <ChatPanel status={status} result={result} error={error} />
        <div className="stack">
          <FormPreview />
          <IssueCard />
        </div>
      </section>
    </main>
  );
}
