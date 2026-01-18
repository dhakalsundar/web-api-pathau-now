Frontend <-> Backend Integration
--------------------------------

Changes added to connect the Next.js frontend with the backend API:

- Created `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000`.
- Added `app/(auth)/_components/apiClient.ts` with `registerUser` and `loginUser` helpers.

How to wire into existing forms

In your existing `RegisterForm.tsx` replace the submit handler to use the client:

```tsx
import { registerUser } from './_components/apiClient';

async function onSubmit(values) {
  try {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      username: values.username,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    const res = await registerUser(payload);
    console.log('Registered', res);
  } catch (err) {
    console.error('Register error', err);
  }
}
```

In `LoginForm.tsx` replace the submit handler to call `loginUser` similarly:

```tsx
import { loginUser } from './_components/apiClient';

async function onSubmit(values) {
  try {
    const res = await loginUser({ email: values.email, password: values.password });
    // store token if present: localStorage.setItem('token', res.token)
    console.log('Logged in', res);
  } catch (err) {
    console.error('Login error', err);
  }
}
```

Running

1. Start backend (from your backend folder):
```bash
npm install
npm run build
npm start
```

2. Start frontend (from frontend folder):
```bash
npm install
npm run dev
```

3. Import `postman_auth_collection.json` (backend repo) and point `baseUrl` to `http://localhost:5000` to test via Postman.
