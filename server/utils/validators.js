import { inspectDemoForm } from '../services/formInspector.js';

export function validateFieldMappings(mappings) {
  if (!Array.isArray(mappings)) {
    const error = new Error('Mappings must be an array.');
    error.statusCode = 400;
    throw error;
  }

  const fieldNames = new Set(inspectDemoForm().fields.map((field) => field.name));
  const issues = [];

  const sanitized = mappings.map((mapping, index) => {
    const field = String(mapping?.field ?? '').trim();
    const value = String(mapping?.value ?? '').trim();
    const confidence = Number(mapping?.confidence ?? 0);

    if (!fieldNames.has(field)) {
      issues.push({ index, field, message: 'Unknown demo form field.' });
    }

    if (!value) {
      issues.push({ index, field, message: 'Mapped value is empty.' });
    }

    if (confidence < 0.7) {
      issues.push({ index, field, message: 'Low confidence mapping requires user review.' });
    }

    return {
      field,
      value,
      confidence: Number.isFinite(confidence) ? confidence : 0,
      source: String(mapping?.source ?? 'unknown'),
      reasoning: mapping?.reasoning ? String(mapping.reasoning) : undefined
    };
  });

  return {
    valid: issues.length === 0,
    issues,
    mappings: sanitized
  };
}
