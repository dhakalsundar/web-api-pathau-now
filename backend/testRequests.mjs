import fetch from 'node-fetch';

async function run() {
  try {
    const regRes = await fetch('http://localhost:5050/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Auto',
        lastName: 'Tester',
        email: 'autotest@example.com',
        username: 'autotest',
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    console.log('Register status:', regRes.status);
    console.log('Register body:', await regRes.text());

    const loginRes = await fetch('http://localhost:5050/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'autotest@example.com', password: 'password123' })
    });
    console.log('Login status:', loginRes.status);
    console.log('Login body:', await loginRes.text());
  } catch (err) {
    console.error('Request error', err);
  }
}

run();
