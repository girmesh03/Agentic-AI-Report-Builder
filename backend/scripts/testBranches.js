/**
 * @module scripts/testBranches
 * @description Native HTTP integration test suite for Branch Management endpoints.
 * Exercises endpoints against live backend on port 4000 using native fetch with zero external test runners.
 */
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4000/api/v1';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromHeaders(headers) {
    const setCookieHeaders = headers.getSetCookie ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
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
  console.log('🚀 Running Phase 3 Branch Management Integration Test Suite...');
  const jar = new CookieJar();
  const testEmail = `test.branch.supervisor.${Date.now()}@company.com`;
  const password = 'BranchPassword123!';

  // Step 1: Register test supervisor
  console.log('\n1. Registering test supervisor...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password,
      confirmPassword: password,
      firstName: 'Branch',
      lastName: 'Supervisor',
    }),
  });
  jar.setFromHeaders(regRes.headers);
  const regData = await regRes.json();
  assert.equal(regRes.status, 201, `Registration expected 201, got ${regRes.status}`);
  console.log('   ✅ Supervisor registered.');

  // Step 2: Login to obtain httpOnly cookies
  console.log('\n2. Logging in to obtain session cookies...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password }),
  });
  jar.setFromHeaders(loginRes.headers);
  assert.equal(loginRes.status, 200, `Login expected 200, got ${loginRes.status}`);
  console.log('   ✅ Logged in successfully.');

  let branch1Id = null;
  let branch2Id = null;

  // Step 3: Create Branch 1 (Bole Medhanialem)
  console.log('\n3. Testing POST /api/v1/branches (Create Branch)...');
  const createRes1 = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: 'Bole Medhanialem',
      phone: '+251911223344',
      address: 'Bole, near Edna Mall',
    }),
  });
  const createData1 = await createRes1.json();
  assert.equal(createRes1.status, 201, `Expected 201, got ${createRes1.status}: ${JSON.stringify(createData1)}`);
  assert.equal(createData1.success, true);
  assert.equal(createData1.data.name, 'Bole Medhanialem');
  assert.equal(createData1.data.normalizedName, 'bole medhanialem');
  assert.equal(createData1.data.isArchived, false);
  branch1Id = createData1.data._id;
  console.log(`   ✅ Branch 1 created: ${branch1Id}`);

  // Step 4: Reject duplicate normalized branch name (409 Conflict)
  console.log('\n4. Testing duplicate normalized branch name rejection (409 Conflict)...');
  const duplicateRes = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: '  bole MEDHANIALEM  ',
      phone: '+251911999999',
    }),
  });
  const duplicateData = await duplicateRes.json();
  assert.equal(duplicateRes.status, 409, `Expected 409, got ${duplicateRes.status}`);
  assert.equal(duplicateData.success, false);
  console.log('   ✅ Duplicate normalized name rejected with 409 Conflict.');

  // Step 5: Test validation errors (invalid phone format, empty name)
  console.log('\n5. Testing validation error rejection (422 Unprocessable Entity)...');
  const invalidPhoneRes = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: 'Invalid Phone Branch',
      phone: '0911223344', // Missing +251
    }),
  });
  assert.equal(invalidPhoneRes.status, 422, `Expected 422, got ${invalidPhoneRes.status}`);
  console.log('   ✅ Invalid phone format rejected with 422.');

  const emptyNameRes = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({ name: '   ' }),
  });
  assert.equal(emptyNameRes.status, 422, `Expected 422, got ${emptyNameRes.status}`);
  console.log('   ✅ Empty branch name rejected with 422.');

  // Step 6: Create Branch 2 (Sarbet Branch)
  console.log('\n6. Creating second branch (Sarbet Branch)...');
  const createRes2 = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: 'Sarbet Branch',
      phone: '+251922334455',
      address: 'Sarbet, near Vatican Embassy',
    }),
  });
  const createData2 = await createRes2.json();
  assert.equal(createRes2.status, 201);
  branch2Id = createData2.data._id;
  console.log(`   ✅ Branch 2 created: ${branch2Id}`);

  // Step 7: List active branches (GET /api/v1/branches)
  console.log('\n7. Testing GET /api/v1/branches (List Active Branches)...');
  const listRes = await fetch(`${BASE_URL}/branches`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const listData = await listRes.json();
  assert.equal(listRes.status, 200);
  assert.equal(listData.success, true);
  assert.equal(listData.data.totalDocs >= 2, true);
  assert.equal(listData.data.docs.length >= 2, true);
  console.log(`   ✅ Active branches listed (${listData.data.totalDocs} total docs).`);

  // Step 8: Search branches by query
  console.log('\n8. Testing GET /api/v1/branches?search=Edna (Search filter)...');
  const searchRes = await fetch(`${BASE_URL}/branches?search=Edna`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const searchData = await searchRes.json();
  assert.equal(searchRes.status, 200);
  assert.equal(searchData.data.docs.length, 1);
  assert.equal(searchData.data.docs[0].name, 'Bole Medhanialem');
  console.log('   ✅ Search query filtered accurately.');

  // Step 9: Get Branch Details (GET /api/v1/branches/:branchId)
  console.log('\n9. Testing GET /api/v1/branches/:branchId (Branch Details)...');
  const detailRes = await fetch(`${BASE_URL}/branches/${branch1Id}`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const detailData = await detailRes.json();
  assert.equal(detailRes.status, 200);
  assert.equal(detailData.data._id, branch1Id);
  assert.equal(detailData.data.totalReports !== undefined, true);
  assert.equal(detailData.data.openIssues !== undefined, true);
  console.log('   ✅ Branch details and computed statistics retrieved.');

  // Step 10: Update Branch (PUT /api/v1/branches/:branchId)
  console.log('\n10. Testing PUT /api/v1/branches/:branchId (Update Branch)...');
  const updateRes = await fetch(`${BASE_URL}/branches/${branch1Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      address: 'Bole Tele Building, 3rd Floor',
      phone: '+251911998877',
    }),
  });
  const updateData = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateData.data.address, 'Bole Tele Building, 3rd Floor');
  assert.equal(updateData.data.phone, '+251911998877');
  console.log('   ✅ Branch updated successfully.');

  // Step 11: Collision check on update
  console.log('\n11. Testing collision check on update (409 Conflict)...');
  const conflictUpdateRes = await fetch(`${BASE_URL}/branches/${branch2Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: 'Bole Medhanialem', // Same as branch 1
    }),
  });
  assert.equal(conflictUpdateRes.status, 409);
  console.log('   ✅ Renaming to colliding branch name rejected with 409 Conflict.');

  // Step 12: Soft-Archive Branch (DELETE /api/v1/branches/:branchId)
  console.log('\n12. Testing DELETE /api/v1/branches/:branchId (Soft-Archive)...');
  const archiveRes = await fetch(`${BASE_URL}/branches/${branch1Id}`, {
    method: 'DELETE',
    headers: { Cookie: jar.getCookieHeader() },
  });
  const archiveData = await archiveRes.json();
  assert.equal(archiveRes.status, 200);
  assert.equal(archiveData.success, true);
  console.log('   ✅ Branch soft-archived successfully.');

  // Step 13: Confirm archived branch is excluded from active list
  console.log('\n13. Verifying archived branch excluded from default active list...');
  const activeAfterArchiveRes = await fetch(`${BASE_URL}/branches`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const activeAfterArchiveData = await activeAfterArchiveRes.json();
  const foundInActive = activeAfterArchiveData.data.docs.some((b) => b._id === branch1Id);
  assert.equal(foundInActive, false, 'Archived branch should NOT appear in default active list');
  console.log('   ✅ Verified archived branch excluded from active list.');

  // Step 14: Confirm archived branch appears in isArchived=true list
  console.log('\n14. Verifying archived branch appears under isArchived=true query...');
  const archivedQueryRes = await fetch(`${BASE_URL}/branches?isArchived=true`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const archivedQueryData = await archivedQueryRes.json();
  const foundInArchived = archivedQueryData.data.docs.some((b) => b._id === branch1Id);
  assert.equal(foundInArchived, true, 'Archived branch MUST appear in isArchived=true list');
  console.log('   ✅ Verified archived branch found under isArchived=true query.');

  // Step 15: Restore Archived Branch (PATCH /api/v1/branches/:branchId/restore)
  console.log('\n15. Testing PATCH /api/v1/branches/:branchId/restore (Restore Branch)...');
  const restoreRes = await fetch(`${BASE_URL}/branches/${branch1Id}/restore`, {
    method: 'PATCH',
    headers: { Cookie: jar.getCookieHeader() },
  });
  const restoreData = await restoreRes.json();
  assert.equal(restoreRes.status, 200);
  assert.equal(restoreData.data.isArchived, false);
  console.log('   ✅ Branch restored successfully.');

  // Step 16: Verify restored branch appears back in active list
  console.log('\n16. Verifying restored branch is back in active list...');
  const activeAfterRestoreRes = await fetch(`${BASE_URL}/branches`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const activeAfterRestoreData = await activeAfterRestoreRes.json();
  const foundRestored = activeAfterRestoreData.data.docs.some((b) => b._id === branch1Id);
  assert.equal(foundRestored, true, 'Restored branch MUST appear in active list');
  console.log('   ✅ Verified restored branch is active again.');

  // Step 17: Unauthorized access check
  console.log('\n17. Testing unauthorized access without cookies (401)...');
  const unauthRes = await fetch(`${BASE_URL}/branches`);
  assert.equal(unauthRes.status, 401);
  console.log('   ✅ Unauthorized request rejected with 401.');

  // Step 18: Clean up test account via account cascade deletion
  console.log('\n18. Cleaning up test supervisor account...');
  const deleteRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
  assert.equal(deleteRes.status, 200);
  console.log('   ✅ Test supervisor and cascaded data cleaned up successfully.');

  console.log('\n🎉 ALL 18 PHASE 3 BRANCH MANAGEMENT INTEGRATION TESTS PASSED!\n');
};

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
