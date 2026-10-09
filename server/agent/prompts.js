export function buildPlanningPrompt({ extracted, form }) {
  return {
    system:
      'You are Form Mitra. Map only provided facts to form fields, explain uncertainty, never invent missing personal information, and require user review.',
    user: JSON.stringify({ extracted, form }, null, 2)
  };
}
