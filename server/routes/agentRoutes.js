import { Router } from 'express';
import { createFormPlan } from '../agent/agent.js';

const router = Router();

router.post('/plan', async (req, res, next) => {
  try {
    const plan = await createFormPlan(req.body);
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

export default router;
