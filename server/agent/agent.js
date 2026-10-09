import { buildPlanningPrompt } from './prompts.js';
import { mapFactsToDemoFields } from './tools.js';
import { runModelPrompt } from '../services/modelService.js';
import { inspectDemoForm } from '../services/formInspector.js';
import { validateFieldMappings } from '../utils/validators.js';

export async function createFormPlan({ extracted } = {}) {
  const demoForm = inspectDemoForm();
  const prompt = buildPlanningPrompt({ extracted, form: demoForm });
  const model = await runModelPrompt(prompt);

  let proposedMappings = [];
  let validation = { valid: false, issues: [], mappings: [] };
  let missingFields = [];
  let ambiguities = [];
  let summary = '';

  if (model.status === 'connected' && model.output) {
    const parsed = parseModelJson(model.output);

    if (parsed && Array.isArray(parsed.mappings)) {
      summary = parsed.summary || 'Model analyzed draft and proposed field mappings.';

      // Filter to fields that actually exist in the form schema
      const validFieldNames = new Set(demoForm.fields.map((f) => f.name));
      const filteredModelMappings = parsed.mappings.filter((m) => validFieldNames.has(m?.field));

      // Retain source and reasoning metadata from the model
      const sourceMap = new Map();
      const reasoningMap = new Map();
      parsed.mappings.forEach((m) => {
        if (m.field) {
          if (m.source) sourceMap.set(m.field, m.source);
          if (m.reasoning) reasoningMap.set(m.field, m.reasoning);
        }
      });

      // Run through standard backend validators
      try {
        validation = validateFieldMappings(filteredModelMappings);
        proposedMappings = validation.mappings.map((m) => ({
          ...m,
          source: sourceMap.get(m.field) ?? m.source ?? 'model-extraction',
          reasoning: reasoningMap.get(m.field) ?? undefined
        }));
      } catch {
        proposedMappings = mapFactsToDemoFields(extracted?.facts ?? {});
        validation = validateFieldMappings(proposedMappings);
      }

      // Calculate missing required fields
      const mappedFields = new Set(
        proposedMappings.filter((m) => m.value && m.value.trim() !== '').map((m) => m.field)
      );

      demoForm.fields.forEach((field) => {
        if (field.required && !mappedFields.has(field.name)) {
          const modelMissing = Array.isArray(parsed.missingFields)
            ? parsed.missingFields.find((mf) => mf.field === field.name)
            : null;

          missingFields.push({
            field: field.name,
            label: field.label,
            required: true,
            question: modelMissing?.question ?? `Please provide your ${field.label.toLowerCase()}.`
          });

          validation.issues.push({
            field: field.name,
            message: `Required field "${field.label}" is missing.`
          });
          validation.valid = false;
        }
      });

      // Collect ambiguities
      if (Array.isArray(parsed.ambiguities)) {
        ambiguities = parsed.ambiguities;
      }
    } else {
      // Model returned output but not parseable as mapping JSON
      proposedMappings = mapFactsToDemoFields(extracted?.facts ?? {});
      validation = validateFieldMappings(proposedMappings);
    }
  } else {
    // Deterministic fallback when model is not configured, fails, or key missing
    proposedMappings = mapFactsToDemoFields(extracted?.facts ?? {});
    validation = validateFieldMappings(proposedMappings);
  }

  // Fallback calculation for missing fields & ambiguities if not already set by model
  if (missingFields.length === 0 && proposedMappings.length >= 0) {
    const mapped = new Set(proposedMappings.filter((m) => m.value && m.value.trim() !== '').map((m) => m.field));
    demoForm.fields.forEach((field) => {
      if (field.required && !mapped.has(field.name)) {
        missingFields.push({
          field: field.name,
          label: field.label,
          required: true,
          question: `Please provide your ${field.label.toLowerCase()}.`
        });
      }
    });
  }

  if (ambiguities.length === 0) {
    proposedMappings
      .filter((m) => m.confidence < 0.7)
      .forEach((m) => {
        ambiguities.push({
          field: m.field,
          issue: m.reasoning || `Confidence is ${Math.round(m.confidence * 100)}% and requires user review.`,
          question: `Please verify the value for ${m.field}.`
        });
      });
  }

  if (!summary) {
    summary = validation.valid
      ? 'All required fields have been mapped with high confidence.'
      : `Identified ${proposedMappings.length} field suggestion(s) with ${missingFields.length} missing required field(s).`;
  }

  const nextAction = validation.valid && missingFields.length === 0
    ? 'Review the proposed mappings before any browser automation.'
    : 'Ask the user for missing or ambiguous information.';

  return {
    form: demoForm,
    summary,
    proposedMappings,
    missingFields,
    ambiguities,
    validation,
    model: {
      provider: model.provider,
      model: model.model,
      status: model.status,
      message: model.message
    },
    nextAction
  };
}

function parseModelJson(text) {
  if (!text || typeof text !== 'string') return null;

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const rawJson = codeBlockMatch ? codeBlockMatch[1] : text;

  try {
    return JSON.parse(rawJson.trim());
  } catch {
    const start = rawJson.indexOf('{');
    const end = rawJson.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(rawJson.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
