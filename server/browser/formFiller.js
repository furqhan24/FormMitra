import { validateFieldMappings } from '../utils/validators.js';

export async function fillDemoForm(mappings) {
  const validation = validateFieldMappings(mappings);

  if (!validation.valid) {
    return {
      ok: false,
      validation,
      message: 'Browser action skipped because mappings failed validation.'
    };
  }

  return {
    ok: false,
    validation,
    message: 'Playwright filling is scaffolded but not enabled in the initial foundation.'
  };
}
