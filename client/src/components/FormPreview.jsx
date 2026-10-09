const fields = [
  ['Full name', 'Asha Sharma'],
  ['Email', 'asha@example.test'],
  ['Program', 'Community services'],
  ['Requested date', '2026-10-15']
];

export default function FormPreview() {
  return (
    <section className="preview" aria-labelledby="preview-title">
      <div>
        <p className="eyebrow">Demo form</p>
        <h2 id="preview-title">Synthetic review preview</h2>
      </div>
      <div className="preview-grid">
        {fields.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="hint">This is fixture data only. Real submissions are intentionally out of scope.</p>
    </section>
  );
}
