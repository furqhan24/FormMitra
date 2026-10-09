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
    <main className="min-h-screen">
      <section
        className="grid items-center gap-8 bg-[linear-gradient(135deg,rgba(7,37,49,0.94),rgba(16,96,104,0.9)),url('/demo-form-pattern.svg')] bg-cover px-5 py-10 text-[#f5fffd] sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,520px)] lg:px-16 lg:py-20"
        aria-labelledby="page-title"
      >
        <div className="max-w-[720px]">
          <p className="mb-2 text-xs font-extrabold uppercase text-[#7ee0d0]">AI-assisted form filling</p>
          <h1 id="page-title" className="m-0 text-5xl font-extrabold leading-none sm:text-7xl lg:text-8xl">
            Form Mitra
          </h1>
          <p className="mt-5 max-w-[620px] text-base leading-7 sm:text-lg">
            An intelligent, guarded assistant for extracting facts, mapping Community Services fields, flagging
            ambiguity, and keeping humans in control before any submission.
          </p>
        </div>
        <form
          className="grid gap-4 rounded-lg border border-[#1c525b29] bg-white p-5 text-[#16323f] shadow-[0_20px_60px_rgba(7,37,49,0.12)]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <div>
              <label htmlFor="user-text" className="font-extrabold text-[#183946]">
                Known information
              </label>
            </div>
            <div className="mb-1 flex flex-wrap items-center gap-2" aria-label="Synthetic sample inputs">
              <span className="text-xs font-bold uppercase text-[#486581]">Quick test:</span>
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="min-h-7 rounded-full border border-[#bdd4d2] bg-[#fbfefd] px-3 py-1 text-xs font-semibold text-[#0f766e] transition hover:border-[#0f766e] hover:bg-[#0f766e] hover:text-white"
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
              className="min-h-44 w-full resize-y rounded-md border border-[#bdd4d2] bg-[#fbfefd] p-3 text-[#16323f]"
            />
          </div>
          <FileUpload files={files} onFilesChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} />
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && files.length === 0)}
            className="min-h-12 rounded-md bg-[#0f766e] px-4 py-3 font-extrabold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? 'Analyzing with Gemma...' : 'Analyze draft'}
          </button>
        </form>
      </section>

      <section className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:px-12 lg:py-12">
        <ChatPanel status={status} result={result} error={error} />
        <div className="grid gap-6">
          <FormPreview result={result} onSaveReview={handleSaveReview} />
          <IssueCard />
        </div>
      </section>
    </main>
  );
}
