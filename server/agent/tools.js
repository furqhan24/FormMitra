export function mapFactsToDemoFields(facts) {
  const mappings = [];
  const text = String(facts?.rawUserText ?? '').trim();

  // 1. Email extraction
  if (facts.email) {
    mappings.push({ field: 'email', value: facts.email, confidence: 0.95, source: 'email-regex' });
  }

  // 2. Phone extraction
  if (facts.phone) {
    mappings.push({ field: 'phone', value: facts.phone, confidence: 0.9, source: 'phone-regex' });
  }

  // 3. Name extraction with guard against single ambiguous tokens
  const namePatternMatch = text.match(/(?:my name is|name\s*[:\-])\s*([A-Za-z]+(?:\s+[A-Za-z]+)+)/i);
  if (namePatternMatch) {
    mappings.push({
      field: 'fullName',
      value: namePatternMatch[1].trim(),
      confidence: 0.9,
      source: 'name-phrase'
    });
  } else if (/^[A-Za-z]+$/.test(text)) {
    // Single ambiguous token like "pavan"
    mappings.push({
      field: 'fullName',
      value: text,
      confidence: 0.35,
      source: 'ambiguous-single-word',
      reasoning: 'Single name is insufficient to confirm a complete legal full name without review.'
    });
  }

  // 4. Program extraction
  if (/community/i.test(text)) {
    mappings.push({ field: 'program', value: 'Community services', confidence: 0.9, source: 'keyword-match' });
  } else if (/education/i.test(text)) {
    mappings.push({ field: 'program', value: 'Education support', confidence: 0.9, source: 'keyword-match' });
  } else if (/health/i.test(text)) {
    mappings.push({ field: 'program', value: 'Healthcare navigation', confidence: 0.9, source: 'keyword-match' });
  }

  // 5. Date extraction (YYYY-MM-DD)
  const dateMatch = facts?.requestedDate || text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (dateMatch) {
    mappings.push({ field: 'requestedDate', value: dateMatch, confidence: 0.95, source: 'date-regex' });
  }

  // 6. Notes: only if explicit notes/accommodations keywords exist, never dumping bare text
  const notesMatch = text.match(/(?:notes?|additional notes?|special request|assistance|accommodations?)[:\s]+([^\n\r]+)/i);
  if (notesMatch) {
    mappings.push({
      field: 'notes',
      value: notesMatch[1].trim(),
      confidence: 0.75,
      source: 'notes-keyword'
    });
  }

  return mappings;
}
