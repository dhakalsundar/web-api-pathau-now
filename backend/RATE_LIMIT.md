# Express Rate Limit Configuration

## Overview
Rate limiting middleware has been implemented to prevent brute force attacks on authentication endpoints.

## Installation Required
Run this command to install the package:

```bash
cd backend
npm install
```

## Configuration

### Rate Limits Applied

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| **POST /api/auth/register** | 10 req | 15 min | Prevent registration spam |
| **POST /api/auth/login** | 50 req | 15 min | Prevent brute force login attacks |
| **POST /api/auth/refresh** | 30 req | 15 min | Prevent token refresh abuse |

### Middleware Location
`src/middleware/rateLimiter.middleware.ts`

### Key Features

✅ **IP-based rate limiting** - Tracks requests by client IP address
✅ **Email-based login limiting** - Login attempts limited per IP + email combination
✅ **Configurable limits** - Easy to adjust thresholds
✅ **Standard headers** - Returns `RateLimit-*` headers with remaining attempts
✅ **Custom error messages** - Clear feedback when limits exceeded
✅ **429 status code** - Proper HTTP status for rate limit exceeded

## Usage Example

### Client-side handling:

```javascript
// Detect rate limit response
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
.then(response => {
  if (response.status === 429) {
    // Rate limited
    alert('Too many login attempts. Try again in 15 minutes.');
  }
})
.catch(error => console.error(error));
```

### Rate Limit Response (429):

```json
{
  "success": false,
  "message": "Too many login attempts. Account temporarily locked. Please try again in 15 minutes.",
  "error": {
    "statusCode": 429,
    "retryAfter": "15 minutes"
  }
}
```

### Response Headers:

```
RateLimit-Limit: 50
RateLimit-Remaining: 0
RateLimit-Reset: 1708978245
```

## Security Benefits

1. **Brute Force Protection** - Limits login attempts to 50 per 15 minutes
2. **Account Enumeration Prevention** - Tracking by email prevents testing email validity
3. **Registration Spam Control** - Only 10 registrations per IP per 15 minutes
4. **Token Refresh Abuse Prevention** - Limits refresh token generation attempts
5. **DDoS Mitigation** - Reduces impact of distributed attacks on auth endpoints

## How It Works

```
Client Request
    ↓
Check IP address or identifier
    ↓
Look up request count in window
    ↓
If count < limit: Process request, increment counter
If count ≥ limit: Return 429 Too Many Requests
    ↓
Counter resets after 15 minutes
```

## Fine-tuning

### Adjust Login Limit

Edit `src/middleware/rateLimiter.middleware.ts`:

```typescript
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Change time window
  max: 50,                    // Change request limit
  // ...
});
```

### Add Rate Limiting to Other Routes

```typescript
import { authLimiter } from '../middleware/rateLimiter.middleware';

router.post('/sensitive-endpoint', authLimiter, controller.action);
```

### Disable Rate Limiting for Testing

Temporarily comment out the limiters:

```typescript
// router.post("/login", loginLimiter, ...);
router.post("/login", ...);  // No rate limit
```

## Production Considerations

### 1. Store in Redis (Recommended)
For distributed systems, use Redis to share rate limit counts:

```bash
npm install rate-limit-redis redis
```

```typescript
import redis from 'redis';
import RedisStore from 'rate-limit-redis';

const redisClient = redis.createClient();

export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 50,
});
```

### 2. Whitelist Trusted IPs

```typescript
export const loginLimiter = rateLimit({
  skip: (req) => {
    const trustedIps = ['127.0.0.1', '::1'];
    return trustedIps.includes(req.ip);
  },
  // ...
});
```

### 3. Different Limits by Time

```typescript
export const loginLimiter = rateLimit({
  max: (req, res) => {
    const hour = new Date().getHours();
    // Stricter during peak hours
    return (hour >= 9 && hour <= 17) ? 30 : 50;
  },
});
```

## Monitoring

### Track Rate Limited Requests

Add logging to the middleware:

```typescript
import { logger } from '../utils/logger';

export const loginLimiter = rateLimit({
  handler: (req, res) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
      timestamp: new Date(),
    });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts'
    });
  }
});
```

### Check Rate Limit Headers

```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Look for RateLimit headers in response:
# RateLimit-Limit: 50
# RateLimit-Remaining: 49
# RateLimit-Reset: 1708978245
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Rate limit too restrictive | Increase `max` value in middleware config |
| Rate limit not applied | Ensure middleware is imported and applied to routes |
| All requests limited | Check IP address detection (may be behind proxy) |
| Limits not shared across servers | Implement Redis store for distributed systems |

## Testing Rate Limits

```bash
# Test login rate limit
for i in {1..60}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Request $i"
done

# After 50 requests, you'll get 429 responses
```

## Related Files

- Configuration: `src/middleware/rateLimiter.middleware.ts`
- Auth Routes: `src/routes/auth.route.ts`
- Dependencies: `package.json`

## Documentation

- Rate Limiting: This file (RATE_LIMIT.md)
- Quick Reference: [RATE_LIMIT_QUICK_REFERENCE.md](RATE_LIMIT_QUICK_REFERENCE.md)

---

**Status:** ✅ Implemented
**Package:** express-rate-limit v7.1.5
**Installation:** `npm install` (required after pulling changes)
