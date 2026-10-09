import { Router } from 'express';
import { inspectDemoForm } from '../services/formInspector.js';
import { validateFieldMappings } from '../utils/validators.js';

const router = Router();

router.get('/demo', (_req, res) => {
  res.json(inspectDemoForm());
});

router.post('/validate', (req, res, next) => {
  try {
    const validation = validateFieldMappings(req.body?.mappings ?? []);
    res.json(validation);
  } catch (err) {
    next(err);
  }
});

export default router;
