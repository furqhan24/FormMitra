export async function createDemoBrowserSession() {
  if (process.env.ENABLE_DEMO_BROWSER_AUTOMATION !== 'true') {
    return {
      enabled: false,
      reason: 'Demo browser automation is disabled by default.'
    };
  }

  return {
    enabled: true,
    scope: 'data/demo-form/index.html'
  };
}
