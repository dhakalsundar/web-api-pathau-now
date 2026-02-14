/*
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║           EXPRESS RATE LIMIT - QUICK REFERENCE GUIDE                       ║
 ╚════════════════════════════════════════════════════════════════════════════╝
*/

// ====== SETUP ======
// 1. Already installed: express-rate-limit in package.json
// 2. Already implemented: src/middleware/rateLimiter.middleware.ts
// 3. Already applied to routes: src/routes/auth.route.ts

npm install    // Run after pulling changes

// ====== CURRENT LIMITS ======

POST /api/auth/register
  Limit: 10 requests per 15 minutes
  Purpose: Prevent registration spam
  Key: IP address

POST /api/auth/login
  Limit: 50 requests per 15 minutes
  Purpose: Brute force protection
  Key: IP + email

POST /api/auth/refresh
  Limit: 30 requests per 15 minutes
  Purpose: Token refresh abuse prevention
  Key: IP address

// ====== RESPONSE WHEN LIMITED (429) ======

{
  "success": false,
  "message": "Too many login attempts. Account temporarily locked.",
  "error": {
    "statusCode": 429,
    "retryAfter": "15 minutes"
  }
}

// ====== HEADERS ======

RateLimit-Limit: 50        // Total requests allowed
RateLimit-Remaining: 0     // Remaining requests
RateLimit-Reset: 1708978245  // Unix timestamp when limit resets

// ====== USAGE IN CODE ======

// The rate limiters are already applied to routes:

import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimiter.middleware';

router.post("/login", loginLimiter, ...);        // ✅ Already applied
router.post("/register", registerLimiter, ...);  // ✅ Already applied
router.post("/refresh", refreshLimiter, ...);    // ✅ Already applied

// To add rate limit to other routes:
router.post("/sensitive", authLimiter, controller.action);

// ====== CONFIGURATION DETAILS ======

authLimiter
  windowMs: 15 * 60 * 1000     // 15 minutes
  max: 100                      // 100 requests
  standardHeaders: true         // Return RateLimit-* headers
  legacyHeaders: false          // No X-RateLimit-* headers
  keyGenerator: (req)           // Uses IP address
  handler: (req, res)           // Custom 429 response

loginLimiter
  windowMs: 15 * 60 * 1000     // 15 minutes
  max: 50                       // 50 attempts
  keyGenerator: IP + email      // Combined key for accuracy

registerLimiter
  windowMs: 15 * 60 * 1000     // 15 minutes
  max: 10                       // 10 registrations
  keyGenerator: IP address      // Prevent spam signups

refreshLimiter
  windowMs: 15 * 60 * 1000     // 15 minutes
  max: 30                       // 30 refresh attempts
  keyGenerator: IP address      // Prevent abuse

// ====== ADJUST LIMITS ======

// Edit: src/middleware/rateLimiter.middleware.ts

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // ← Change time window
  max: 50,                    // ← Change request limit
  // ...
});

// Common values:
// 5 minutes:  5 * 60 * 1000
// 15 minutes: 15 * 60 * 1000 (current)
// 1 hour:     60 * 60 * 1000
// 24 hours:   24 * 60 * 60 * 1000

// ====== DISABLE FOR TESTING ======

// Comment out in src/routes/auth.route.ts:

// router.post("/login", loginLimiter, ...);
router.post("/login", ...);  // No rate limit

// ====== WHITELIST IN TESTS ======

// Skip rate limit for specific IPs:

const limiter = rateLimit({
  skip: (req) => {
    return req.ip === '127.0.0.1' || req.ip === '::1';
  },
  // ...
});

// ====== PRODUCTION SETUP ======

// For multi-server deployments, use Redis:

npm install rate-limit-redis redis

// Configure in rateLimiter.middleware.ts:

import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const client = redis.createClient();

export const loginLimiter = rateLimit({
  store: new RedisStore({
    client,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 50,
});

// ====== TESTING RATE LIMITS ======

// Manual test:
for i = 1 to 60:
  POST /api/auth/login
  Response 1-50:   200 OK
  Response 51-60:  429 Too Many Requests

// Using curl:
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

// Check headers:
curl -i http://localhost:5000/api/auth/login

// ====== LOGGING RATE LIMITS ======

// Add to middleware handler:

handler: (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    email: req.body?.email,
    endpoint: req.path,
  });
  res.status(429).json({ ... });
}

// ====== FILES ======

// Configuration:
// src/middleware/rateLimiter.middleware.ts

// Applied to routes:
// src/routes/auth.route.ts

// Dependencies:
// package.json

// Documentation:
// RATE_LIMIT.md (detailed)
// RATE_LIMIT_QUICK_REFERENCE.md (this file)

// ====== SECURITY NOTES ======

✅ Prevents brute force attacks
✅ Limits registration spam
✅ Prevents token abuse
✅ Uses IP + email for login (prevents enumeration)
✅ Returns proper 429 status code
✅ Provides retry information

❌ Does NOT:
  - Work across multiple servers without Redis
  - Protect against distributed attacks alone
  - Store historical data

// ====== COMMON HTTP STATUS CODES ======

200 OK                 - Request succeeded
401 Unauthorized       - Invalid credentials
429 Too Many Requests  - Rate limit exceeded ← Rate limiter returns this
500 Server Error       - Server error

// ====== TROUBLESHOOTING ======

Problem: Rate limit not working
Solution: Run `npm install` to get express-rate-limit

Problem: Different limits across servers
Solution: Use Redis store for shared rate limiting

Problem: Legitimate users blocked
Solution: Increase max value or duration

Problem: Rate limits bypass
Solution: Check IP detection (may be behind proxy)

// ====== NEXT STEPS ======

1. ✅ npm install (install express-rate-limit)
2. ✅ npm run dev (start server)
3. ✅ Test rate limits with curl or Postman
4. 📊 Monitor rate limited requests in logs
5. 🔧 Adjust limits based on usage patterns

/*
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║  Anti-brute force protection active on all auth endpoints! ✅             ║
 ╚════════════════════════════════════════════════════════════════════════════╝
*/
