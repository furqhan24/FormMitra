import { buildPlanningPrompt } from './prompts.js';
import { mapFactsToDemoFields } from './tools.js';
import { runModelPrompt } from '../services/modelService.js';
import { inspectDemoForm } from '../services/formInspector.js';
import { validateFieldMappings } from '../utils/validators.js';

export async function createFormPlan({ extracted } = {}) {
  const demoForm = inspectDemoForm();
  const proposedMappings = mapFactsToDemoFields(extracted?.facts ?? {});
  const validation = validateFieldMappings(proposedMappings);
  const prompt = buildPlanningPrompt({ extracted, form: demoForm });
  const model = await runModelPrompt(prompt);

  return {
    form: demoForm,
    proposedMappings,
    validation,
    model,
    nextAction: validation.valid
      ? 'Review the proposed mappings before any browser automation.'
      : 'Ask the user for missing or ambiguous information.'
  };
}
