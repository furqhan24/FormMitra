export function inspectDemoForm() {
  return {
    id: 'demo-community-services-request',
    title: 'Community Services Request',
    source: 'data/demo-form/index.html',
    syntheticOnly: true,
    fields: [
      { name: 'fullName', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: false },
      { name: 'program', label: 'Program', type: 'select', required: true },
      { name: 'requestedDate', label: 'Requested date', type: 'date', required: true },
      { name: 'notes', label: 'Additional notes', type: 'textarea', required: false }
    ]
  };
}
