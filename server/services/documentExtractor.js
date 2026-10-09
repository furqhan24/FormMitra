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
  const facts = {};
  if (!text) return facts;

  // 1. Email extraction
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) {
    facts.email = emailMatch[0];
  }

  // 2. Date extraction (ISO YYYY-MM-DD or standard date formats)
  const dateMatch = text.match(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/) || text.match(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/);
  if (dateMatch) {
    facts.requestedDate = dateMatch[0];
  }

  // 3. Phone extraction: must NOT match dates like 2026-11-15
  // A. Check for labeled phone number first (e.g., "phone: +1-555-0199", "mobile: 9876543210")
  const labeledPhone = text.match(/(?:phone|tel|mobile|cell|contact|call)(?:\s*(?:number|no|#))?[:\s]+(\+?[\d\s().-]{7,}\d)/i);
  if (labeledPhone && !isDatePattern(labeledPhone[1])) {
    facts.phone = labeledPhone[1].trim();
  }

  // B. Standard phone formats (e.g. +1-555-0199, (555) 019-9999, 555-019-9999)
  if (!facts.phone) {
    const formattedPhone = text.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/);
    if (formattedPhone && !isDatePattern(formattedPhone[0])) {
      facts.phone = formattedPhone[0].trim();
    }
  }

  // C. International phone with + prefix (e.g. +1-555-0199)
  if (!facts.phone) {
    const plusPhone = text.match(/\+\d[\d\s().-]{6,}\d\b/);
    if (plusPhone && !isDatePattern(plusPhone[0])) {
      facts.phone = plusPhone[0].trim();
    }
  }

  if (text) facts.rawUserText = text;

  return facts;
}

function isDatePattern(str) {
  if (!str) return false;
  const s = String(str).trim();
  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(s)) return true;
  // DD-MM-YYYY, MM/DD/YYYY, etc.
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(s)) return true;
  return false;
}
