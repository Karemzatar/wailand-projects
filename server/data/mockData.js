const dayMs = 24 * 60 * 60 * 1000;

function toISODate(date) {
  // Keep it simple: JSON-safe ISO string.
  return new Date(date).toISOString();
}

function makeMockProjectFromCode(code) {
  const now = Date.now();
  const expiry = new Date(now + 90 * dayMs);

  return {
    projectCode: code,
    recipientName: 'Test User',
    recipientEmail: 'test.user@example.com',
    companyName: 'Acme Corp',
    phoneNumber: '',
    projectSupervisor: 'Sarah Jenkins',
    expiryDate: toISODate(expiry),
    status: 'Active',
    notes: [
      {
        content: 'Initial kickoff notes were added. Please review the latest mockups.',
        author: 'System',
        date: toISODate(new Date(now - 2 * dayMs)),
      },
      {
        content: 'Design phase is progressing. Awaiting feedback on color contrast.',
        author: 'System',
        date: toISODate(new Date(now - 1 * dayMs)),
      },
    ],
    activityLog: [
      { action: 'Project initiated (mock)', date: toISODate(new Date(now - 3 * dayMs)) },
      { action: 'Meeting notes added (mock)', date: toISODate(new Date(now - 2 * dayMs)) },
      { action: 'Updated design assets (mock)', date: toISODate(new Date(now - 1 * dayMs)) },
    ],
    createdAt: toISODate(new Date(now - 5 * dayMs)),
  };
}

function makeMockAdminProjects() {
  const p1 = makeMockProjectFromCode('A1b2C3d4E5f6G7h8');
  const p2 = makeMockProjectFromCode('Z9y8X7w6V5u4T3s2');

  // Slightly vary fields so UI feels real.
  p1.companyName = 'Acme Corp Portal';
  p2.companyName = 'Stark Industries MVP';
  p2.status = 'Active';

  return [
    { ...p1, _id: 'mock-1' },
    { ...p2, _id: 'mock-2' },
  ];
}

module.exports = { makeMockProjectFromCode, makeMockAdminProjects };

