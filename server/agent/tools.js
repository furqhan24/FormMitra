export function mapFactsToDemoFields(facts) {
  const mappings = [];

  if (facts.rawUserText) {
    mappings.push({ field: 'notes', value: facts.rawUserText, confidence: 0.45, source: 'user-text' });
  }

  if (facts.email) {
    mappings.push({ field: 'email', value: facts.email, confidence: 0.9, source: 'regex' });
  }

  if (facts.phone) {
    mappings.push({ field: 'phone', value: facts.phone, confidence: 0.8, source: 'regex' });
  }

  return mappings;
}
