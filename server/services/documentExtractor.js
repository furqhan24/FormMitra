const SUPPORTED_PLACEHOLDER_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

export async function extractFromRequest({ text = '', files = [] }) {
  const normalizedText = String(text ?? '').trim();

  return {
    extractedText: normalizedText,
    facts: extractSimpleFacts(normalizedText),
    files: files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: SUPPORTED_PLACEHOLDER_TYPES.has(file.mimetype)
        ? 'queued-for-future-parser'
        : 'unsupported-file-type'
    })),
    limitations: [
      'Direct text extraction is active.',
      'PDF and image OCR parsers are not implemented yet.'
    ]
  };
}

function extractSimpleFacts(text) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  const facts = {};

  if (emailMatch) facts.email = emailMatch[0];
  if (phoneMatch) facts.phone = phoneMatch[0].trim();
  if (text) facts.rawUserText = text;

  return facts;
}
