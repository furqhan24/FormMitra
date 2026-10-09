export default function IssueCard() {
  return (
    <section
      className="rounded-lg border border-[#1c525b29] bg-white p-5 shadow-[0_20px_60px_rgba(7,37,49,0.12)]"
      aria-labelledby="issue-title"
    >
      <p className="mb-2 text-xs font-extrabold uppercase text-[#1b7f79]">Guardrails</p>
      <h2 id="issue-title" className="m-0 text-xl font-bold text-[#16323f]">
        Review required
      </h2>
      <p className="mt-3 text-[#334e5a]">
        Form Mitra must ask for clarification when data is missing or ambiguous, and it must never invent personal
        information or submit a consequential form without confirmation.
      </p>
    </section>
  );
}
