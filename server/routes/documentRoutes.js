import { Router } from 'express';
import multer from 'multer';
import { extractFromRequest } from '../services/documentExtractor.js';

const router = Router();
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

router.post('/extract', upload.array('documents', 5), async (req, res, next) => {
  try {
    const result = await extractFromRequest({ text: req.body.text, files: req.files ?? [] });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
