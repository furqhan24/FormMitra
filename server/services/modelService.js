export async function runModelPrompt({ system, user }) {
  const provider = process.env.MODEL_PROVIDER ?? 'local-open-weight';
  const endpoint = process.env.MODEL_ENDPOINT;
  const model = process.env.MODEL_NAME ?? 'llama3.1';

  if (!endpoint) {
    return {
      provider,
      model,
      status: 'not-configured',
      message: 'Set MODEL_ENDPOINT and MODEL_NAME to connect an open-weight model provider.',
      system,
      user
    };
  }

  return {
    provider,
    model,
    status: 'not-called',
    message: 'Provider adapter is intentionally pending; add an HTTP adapter once a local/open-weight endpoint is chosen.'
  };
}
