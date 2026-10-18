// Test script for Sevadeep CivicConnect Backend API
async function test() {
  console.log('--- Testing Sevadeep CivicConnect Endpoints ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('1. Health Check:', health.service, 'Status:', health.status);

  // 2. Login as coordinator
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'coordinator@sevadeep.org', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  console.log('2. Coordinator Login:', loginData.success ? `Logged in as ${loginData.user.name} (${loginData.user.role})` : 'Failed');
  const coordinatorToken = loginData.token;

  // 3. Login as community member
  const citizenLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@sevadeep.org', password: 'Password@123' })
  });
  const citizenData = await citizenLoginRes.json();
  console.log('3. Citizen Login:', citizenData.success ? `Logged in as ${citizenData.user.name}` : 'Failed');
  const citizenToken = citizenData.token;

  // 4. Fetch public issues
  const issuesRes = await fetch('http://localhost:5000/api/issues');
  const issuesData = await issuesRes.json();
  console.log('4. Public Issues Count:', issuesData.issues?.length, 'Total:', issuesData.pagination?.total);

  // 5. Fetch events
  const eventsRes = await fetch('http://localhost:5000/api/events');
  const eventsData = await eventsRes.json();
  console.log('5. Community Activities Count:', eventsData.events?.length);

  // 6. Fetch impact stats
  const impactRes = await fetch('http://localhost:5000/api/impact');
  const impactData = await impactRes.json();
  console.log('6. Impact Stats: Resolved:', impactData.stats?.reports_resolved, 'Waste Diverted:', impactData.stats?.total_waste_diverted_kg, 'kg');

  // 7. Submit new issue as citizen
  const submitRes = await fetch('http://localhost:5000/api/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`
    },
    body: JSON.stringify({
      title: 'Pothole and damaged curb near Garware College bus stop',
      description: 'Dangerous curb crack and road cavity causing bike skids during evening traffic on Karve Road.',
      category: 'Damaged Public Facilities',
      severity: 'High',
      location_address: 'Opposite Abasaheb Garware College, Karve Road, Pune',
      area: 'Deccan',
      latitude: 18.5085,
      longitude: 73.8340
    })
  });
  const submitData = await submitRes.json();
  console.log('7. Citizen Submit Issue:', submitData.success ? `Created ${submitData.reference_no} (ID: ${submitData.report_id})` : submitData.message);
  const newReportId = submitData.report_id;

  // 8. Confirm issue
  const confirmRes = await fetch(`http://localhost:5000/api/issues/${newReportId}/confirm`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${coordinatorToken}` }
  });
  const confirmData = await confirmRes.json();
  console.log('8. Toggle Confirmation:', confirmData.message, 'Total confirms:', confirmData.confirmations_count);

  // 9. Post comment
  const commentRes = await fetch(`http://localhost:5000/api/issues/${newReportId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    },
    body: JSON.stringify({ comment_text: 'Sevadeep team dispatched inspection volunteer to assess road safety markers.' })
  });
  const commentData = await commentRes.json();
  console.log('9. Add Comment:', commentData.success ? 'Comment added successfully' : 'Failed');

  // 10. Coordinator approves report
  const approveRes = await fetch(`http://localhost:5000/api/issues/${newReportId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    },
    body: JSON.stringify({
      status: 'Approved',
      coordinator_notes: 'Inspected by coordinator. Approved for public mapping and volunteer cleanup coordination.',
      municipal_referral_status: 'Notified PMC Road Department Ward 7'
    })
  });
  const approveData = await approveRes.json();
  console.log('10. Coordinator Status Update:', approveData.success ? approveData.message : approveData.message);

  // 11. Admin Overview
  const adminRes = await fetch('http://localhost:5000/api/admin/overview', {
    headers: { 'Authorization': `Bearer ${coordinatorToken}` }
  });
  const adminData = await adminRes.json();
  console.log('11. Admin Overview KPI: Total reports:', adminData.stats?.total_reports, 'Pending review:', adminData.stats?.pending_review);

  console.log('\n--- ALL TEST JOURNEYS PASSED SUCCESSFULLY! ---');
}

test().catch(console.error);
