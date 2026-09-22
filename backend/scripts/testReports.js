/**
 * @module scripts/testReports
 * @description Native HTTP integration test suite for Daily Supervisory Report endpoints.
 * Exercises endpoints against live backend on port 4000 using native fetch with zero external test runners.
 */
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4000/api/v1';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromHeaders(headers) {
    const setCookieHeaders = headers.getSetCookie
      ? headers.getSetCookie()
      : [headers.get('set-cookie')].filter(Boolean);
    for (const header of setCookieHeaders) {
      const parts = header.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (value) {
        this.cookies.set(name, value);
      } else {
        this.cookies.delete(name);
      }
    }
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }
}

const runTests = async () => {
  console.log('🚀 Running Phase 4 Amharic Report Engine Integration Test Suite...');
  const jar = new CookieJar();
  const testEmail = `test.report.supervisor.${Date.now()}@company.com`;
  const password = 'ReportPassword123!';

  // Step 1: Register test supervisor
  console.log('\n1. Registering test supervisor...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password,
      confirmPassword: password,
      firstName: 'Beza',
      lastName: 'Haile',
    }),
  });
  jar.setFromHeaders(regRes.headers);
  const regData = await regRes.json();
  assert.equal(regRes.status, 201, `Registration expected 201, got ${regRes.status}`);
  console.log('   ✅ Supervisor registered.');

  // Step 2: Login
  console.log('\n2. Logging in...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({ email: testEmail, password }),
  });
  jar.setFromHeaders(loginRes.headers);
  assert.equal(loginRes.status, 200, `Login expected 200, got ${loginRes.status}`);
  console.log('   ✅ Login successful.');

  // Set supervisor profile name
  const updateProfileRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({ fullName: 'Beza Haile' }),
  });
  assert.equal(updateProfileRes.status, 200, 'Profile update expected 200');
  console.log('   ✅ Profile updated to Beza Haile.');

  // Step 3: Create two test branches (Bole and Sarbet)
  console.log('\n3. Creating test branches (Bole and Sarbet)...');
  const branch1Res = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: `Bole Inspection ${Date.now()}`,
      phone: '+251911223344',
      address: 'Bole Road, Addis Ababa',
    }),
  });
  assert.equal(branch1Res.status, 201, 'Branch 1 expected 201');
  const branch1 = (await branch1Res.json()).data;

  const branch2Res = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: `Sarbet Hub ${Date.now()}`,
      phone: '+251922334455',
      address: 'Sarbet, Addis Ababa',
    }),
  });
  assert.equal(branch2Res.status, 201, 'Branch 2 expected 201');
  const branch2 = (await branch2Res.json()).data;
  console.log(`   ✅ Branches created: "${branch1.name}" and "${branch2.name}".`);

  // Step 4: Create single-branch report (with empty issues & empty comments to test fallbacks)
  console.log('\n4. Creating single-branch report with empty issues and comments...');
  const singleReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      date: '2024-09-24',
      branch: branch1._id,
      clockIn: '08:30',
      clockOut: '17:00',
      activities: [
        { text: 'በቼክሊስቱ መሰረት የጠዋት ዝግጅት እና የንፅህና ፍተሻ አረጋግጫለሁ።', status: 'completed' },
        { text: 'የጥሬ ዕቃ እና የፍሪጅ ሙቀት ፍተሻ ተከታትዬ አስተካክያለሁ።', status: 'completed' },
      ],
      issues: [],
      comments: [],
    }),
  });
  assert.equal(singleReportRes.status, 201, `Create report expected 201, got ${singleReportRes.status}`);
  const singleReportData = (await singleReportRes.json()).data;
  const singleReport = singleReportData.report;
  const linkedChat = singleReportData.chat;

  assert.equal(singleReport.type, 'single', 'Report type expected single');
  assert.ok(singleReport.chat, 'Report must link to paired chat');
  assert.ok(linkedChat, 'Chat must be returned in response');
  assert.equal(linkedChat.type, 'report', 'Chat type must be report');

  // Verify plain-text generation and linguistic fallbacks
  console.log('   Testing generated Amharic plain-text report...');
  const genText = singleReport.generated;
  assert.ok(genText, 'generated plain-text report must not be empty');
  assert.ok(!/[#*`_~[\]]/.test(genText), 'generated report must contain zero markdown characters');
  assert.ok(genText.includes(`ብራንች: ${branch1.name}`), 'Must contain primary branch name');
  assert.ok(genText.includes('ስም: Beza Haile'), 'Must contain supervisor name');
  assert.ok(genText.includes('ስራ የገባሁበት ሰዓት: 08:30'), 'Must contain clockIn time');
  assert.ok(genText.includes('ከስራ የወጣሁበት ሰዓት: 17:00'), 'Must contain clockOut time');
  assert.ok(
    genText.includes('በዕለቱ በብራንቹ አፋጣኝ መፍትሄ የሚፈልግ የተለየ ጉዳይ አልነበረም።'),
    'Empty issues must invoke the mandatory no_issue standardized fallback'
  );
  assert.ok(
    genText.includes('በዕለቱ በብራንቹ የነበረው አጠቃላይ የስራ እንቅስቃሴ ደህና ነበር።'),
    'Empty comments must invoke the mandatory default comments fallback'
  );
  console.log('   ✅ Single-branch report created and verified successfully.');

  // Step 5: Create multi-branch report (with visited branches itinerary)
  console.log('\n5. Creating multi-branch report with itinerary...');
  const multiReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      date: '2024-09-24',
      branch: branch1._id, // Bole is primary
      clockIn: '08:00', // Pre-save will sync with visits[0].clockIn = 08:30
      clockOut: '18:00', // Pre-save will sync with visits[1].clockOut = 17:30
      visits: [
        {
          branch: branch2._id,
          clockIn: '08:30',
          clockOut: '11:45',
        },
        {
          branch: branch1._id,
          clockIn: '12:15',
          clockOut: '17:30',
        },
      ],
      activities: [
        { text: 'የካሽ ቆጠራ እና የሰራተኞች ዝግጁነት ተከታትዬ አረጋግጫለሁ።' },
      ],
      issues: [
        { text: 'በአሁኑ ሰዓት በስቶር ውስጥ ፎይል የለም። በፍጥነት ሊቀርብ ይገባል።', status: 'reported' },
      ],
      comments: 'በሳርቤት እና በቦሌ የነበረው አጠቃላይ የስራ እንቅስቃሴ ጥሩ ነበር።',
    }),
  });
  assert.equal(multiReportRes.status, 201, `Multi-branch report expected 201, got ${multiReportRes.status}`);
  const multiReport = (await multiReportRes.json()).data.report;

  assert.equal(multiReport.type, 'multi', 'Report type expected multi');
  assert.equal(multiReport.clockIn, '08:30', 'clockIn must sync with first visit (08:30)');
  assert.equal(multiReport.clockOut, '17:30', 'clockOut must sync with final visit (17:30)');

  const multiGen = multiReport.generated;
  assert.ok(
    multiGen.includes(`ብራንች: ${branch2.name} እና ${branch1.name}`),
    'Branch header must join all visited branches with Amharic conjunction "እና"'
  );
  assert.ok(
    multiGen.includes(`ከ 08:30 – 11:45 (${branch2.name} ብራንች)`),
    'Must include visit timeline interval for branch 2'
  );
  assert.ok(
    multiGen.includes(`ከ 12:15 – 17:30 (${branch1.name} ብራንች)`),
    'Must include visit timeline interval for branch 1'
  );
  assert.ok(
    multiGen.includes('ፎይል የለም'),
    'Must include the documented issue bullet'
  );
  console.log('   ✅ Multi-branch report and chronological sync verified successfully.');

  // Step 6: Get report by ID
  console.log('\n6. Fetching report by ID...');
  const getRes = await fetch(`${BASE_URL}/reports/${singleReport._id}`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  assert.equal(getRes.status, 200, 'Get report expected 200');
  const fetchedReport = (await getRes.json()).data;
  assert.equal(fetchedReport._id, singleReport._id, 'Fetched ID must match');
  console.log('   ✅ Report fetched successfully.');

  // Step 7: List reports with pagination
  console.log('\n7. Listing paginated reports...');
  const listRes = await fetch(`${BASE_URL}/reports?page=1&limit=10`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  assert.equal(listRes.status, 200, 'List reports expected 200');
  const listData = (await listRes.json()).data;
  assert.ok(listData.docs.length >= 2, 'Must have at least 2 reports');
  assert.ok(listData.totalDocs >= 2, 'totalDocs must be at least 2');
  console.log(`   ✅ List returned ${listData.docs.length} reports.`);

  // Step 8: Validation rejection checks
  console.log('\n8. Checking validation error handling...');
  const invalidRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      // Missing required fields
      date: 'invalid-date',
      clockIn: 'bad-time',
    }),
  });
  assert.equal(invalidRes.status, 422, `Expected 422 Unprocessable Entity, got ${invalidRes.status}`);
  const invalidData = await invalidRes.json();
  assert.equal(invalidData.success, false, 'Expected success: false');
  assert.ok(Array.isArray(invalidData.details), 'Expected details array in 422 response');
  console.log('   ✅ 422 validation response verified.');

  // Step 9: Create report using Ethiopian Date format (DD-MM-YY)
  console.log('\n9. Creating report using Ethiopian Date DD-MM-YY string format...');
  const ethReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      date: '14-01-17',
      branch: branch1._id,
      clockIn: '08:30',
      clockOut: '17:00',
      activities: [],
      issues: [],
      comments: [],
    }),
  });
  assert.equal(ethReportRes.status, 201, `Expected 201, got ${ethReportRes.status}`);
  const ethReport = (await ethReportRes.json()).data.report;
  assert.ok(ethReport._id, 'Report ID must be present');
  console.log(`   ✅ Report created with Ethiopian date: ${ethReport.ethiopianDate?.formattedDate || 'DD-MM-YY'}.`);

  console.log('\n🎉 ALL 9 PHASE 4 INTEGRATION TESTS PASSED 100%!\n');
};

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
