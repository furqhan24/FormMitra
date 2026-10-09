const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    },
    ...options
  });

  const payload = await response.json().catch(() => ({
    error: 'The server returned a non-JSON response.'
  }));

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }

  return payload;
}

export function getHealth() {
  return request('/health');
}

export function extractDocument({ text, files }) {
  const formData = new FormData();
  formData.append('text', text);
  Array.from(files).forEach((file) => formData.append('documents', file));

  return request('/documents/extract', {
    method: 'POST',
    body: formData
  });
}

export function createPlan(payload) {
  return request('/agent/plan', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
