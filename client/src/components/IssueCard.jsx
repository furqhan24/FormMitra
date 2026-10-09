export default function IssueCard() {
  return (
    <section className="issue-card" aria-labelledby="issue-title">
      <p className="eyebrow">Guardrails</p>
      <h2 id="issue-title">Review required</h2>
      <p>
        Form Mitra must ask for clarification when data is missing or ambiguous, and it must never invent personal
        information or submit a consequential form without confirmation.
      </p>
    </section>
  );
}
