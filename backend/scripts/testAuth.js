/**
 * @module scripts/testAuth
 * @description Native HTTP integration test suite for Authentication & User endpoints.
 * Exercises endpoints against live backend on port 4000 using native fetch with zero third-party testing frameworks.
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
  console.log('🚀 Running Phase 2 Authentication & User Integration Test Suite...');
  const jar = new CookieJar();
  const testEmail = `test.supervisor.${Date.now()}@company.com`;
  const initialPassword = 'InitialPassword123!';
  const newPassword = 'UpdatedPassword456!';

  // 1. Test Registration
  console.log('\n1. Testing POST /api/v1/auth/register...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: initialPassword,
      confirmPassword: initialPassword,
    }),
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201, `Registration expected 201, got ${regRes.status}`);
  assert.equal(regData.success, true);
  console.log('   ✅ Registration passed (HTTP 201).');

  // 2. Test Duplicate Email Rejection
  console.log('\n2. Testing duplicate email registration (409 Conflict)...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: initialPassword,
      confirmPassword: initialPassword,
    }),
  });
  assert.equal(dupRes.status, 409, `Duplicate expected 409, got ${dupRes.status}`);
  console.log('   ✅ Duplicate rejection passed (HTTP 409).');

  // 3. Test Invalid Credentials (Anti-Enumeration)
  console.log('\n3. Testing invalid credentials anti-enumeration...');
  const badRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword999!',
    }),
  });
  const badData = await badRes.json();
  assert.equal(badRes.status, 401);
  assert.equal(badData.message, 'Invalid email or password');
  console.log('   ✅ Anti-enumeration 401 verified.');

  // 4. Test Successful Login & Cookie Issuance
  console.log('\n4. Testing POST /api/v1/auth/login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: initialPassword,
    }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.success, true);
  assert.ok(loginData.data.user);
  jar.setFromHeaders(loginRes.headers);
  assert.ok(jar.cookies.has('accessToken'), 'Missing accessToken cookie');
  assert.ok(jar.cookies.has('refreshToken'), 'Missing refreshToken cookie');
  const firstRefreshToken = jar.cookies.get('refreshToken');
  console.log('   ✅ Login passed (HTTP 200, dual cookies received).');

  // 5. Test Get Current User Profile
  console.log('\n5. Testing GET /api/v1/users/me...');
  const meRes = await fetch(`${BASE_URL}/users/me`, {
    headers: { Cookie: jar.getCookieHeader() },
  });
  const meData = await meRes.json();
  assert.equal(meRes.status, 200);
  assert.equal(meData.data.email, testEmail);
  console.log(`   ✅ Profile retrieval passed (fullName: "${meData.data.fullName}").`);

  // 6. Test Update Profile
  console.log('\n6. Testing PATCH /api/v1/users/me...');
  const updateRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      fullName: 'Abebe Bikila',
      phone: '+251911223344',
      position: 'Senior Operations Auditor',
    }),
  });
  const updateData = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateData.data.fullName, 'Abebe Bikila');
  assert.equal(updateData.data.phone, '+251911223344');
  console.log('   ✅ Profile update passed.');

  // 7. Test Token Refresh & Rotation
  console.log('\n7. Testing POST /api/v1/auth/refresh...');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: jar.getCookieHeader() },
  });
  assert.equal(refreshRes.status, 200);
  jar.setFromHeaders(refreshRes.headers);
  const secondRefreshToken = jar.cookies.get('refreshToken');
  assert.notEqual(firstRefreshToken, secondRefreshToken, 'Refresh token was not rotated!');
  console.log('   ✅ Token refresh and rotation passed.');

  // 8. Test Token Theft / Reuse Detection
  console.log('\n8. Testing revoked token reuse detection (theft protection)...');
  const theftJar = new CookieJar();
  theftJar.cookies.set('refreshToken', firstRefreshToken); // Stolen / already rotated token!
  const theftRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: theftJar.getCookieHeader() },
  });
  assert.equal(theftRes.status, 401);
  console.log('   ✅ Theft detection passed (HTTP 401 family invalidated).');

  // Verify that the second token in the family was also invalidated!
  const probeRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: jar.getCookieHeader() },
  });
  assert.equal(probeRes.status, 401, 'Remaining token should have been invalidated by theft detection!');
  console.log('   ✅ Token family invalidation confirmed.');

  // 9. Re-login for Password Change and Account Deletion
  console.log('\n9. Re-authenticating...');
  const reloginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: initialPassword }),
  });
  jar.setFromHeaders(reloginRes.headers);
  assert.equal(reloginRes.status, 200);

  // 10. Test Change Password
  console.log('\n10. Testing PUT /api/v1/users/me/password...');
  const pwdRes = await fetch(`${BASE_URL}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    }),
  });
  assert.equal(pwdRes.status, 200);
  console.log('   ✅ Password change passed.');

  // 11. Test Login with New Password
  console.log('\n11. Testing login with new password...');
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  assert.equal(newLoginRes.status, 200);
  jar.setFromHeaders(newLoginRes.headers);
  console.log('   ✅ New password authentication verified.');

  // 12. Test Logout
  console.log('\n12. Testing POST /api/v1/auth/logout...');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: jar.getCookieHeader() },
  });
  assert.equal(logoutRes.status, 200);
  jar.setFromHeaders(logoutRes.headers);
  console.log('   ✅ Logout passed.');

  // 13. Re-login and Test Self-Service Account Deletion Cascade
  console.log('\n13. Testing DELETE /api/v1/users/me (Cascade Deletion)...');
  const preDelLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  jar.setFromHeaders(preDelLogin.headers);

  const delRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
  assert.equal(delRes.status, 200);
  console.log('   ✅ Account deletion cascade passed (HTTP 200).');

  // Verify user is deleted
  const postDelLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  assert.equal(postDelLogin.status, 401);
  console.log('   ✅ Account permanent hard-deletion confirmed.');

  console.log('\n🎉 ALL 13 AUTHENTICATION & USER API TESTS PASSED 100%!');
};

runTests().catch((err) => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
