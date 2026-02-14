/* 
 ╔══════════════════════════════════════════════════════════════════════════╗
 ║                 WINSTON LOGGER - QUICK REFERENCE                         ║
 ╚══════════════════════════════════════════════════════════════════════════╝
*/

// ====== IMPORT ======
import { logger } from './utils/logger';

// ====== LOG LEVELS ======
logger.error('Something went wrong');      // 🔴 Errors only
logger.warn('Warning message');            // 🟡 Warnings
logger.info('Information');                // 🟢 General info (DEFAULT)
logger.debug('Debug details');             // ⚪ Detailed debugging
logger.http('HTTP request');               // 🔵 HTTP requests

// ====== BASIC USAGE ======

// Simple message
logger.info('User logged in');

// With additional data
logger.info('Order created', { orderId: '123', amount: 99.99 });

// Error with stack trace
try {
  risky();
} catch (error) {
  logger.error('Operation failed', error);
}

// Conditional logging
if (DEBUG) {
  logger.debug('Query:', { sql, params });
}

// ====== LOG OUTPUTS ======

// Console          → All logs, colorized (real-time)
// combined.log     → All logs, all levels (audit trail)
// error.log        → Errors only (error tracking)
// http.log         → HTTP requests (api monitoring)
// exceptions.log   → Uncaught exceptions
// rejections.log   → Unhandled promise rejections

// ====== AUTOMATIC HTTP LOGGING ======

// The requestLogger middleware logs all HTTP requests:
// Example: GET /api/users - 200 - 42ms

// Status codes:
// ✅ 200-299 → logger.info()
// ⚠️  300-399 → logger.warn()
// ❌ 400-599 → logger.error()

// ====== ENVIRONMENT VARIABLES ======

// Set LOG_LEVEL in .env:
// LOG_LEVEL=error   - Only errors
// LOG_LEVEL=warn    - Warnings + errors
// LOG_LEVEL=info    - Info + warnings + errors (DEFAULT)
// LOG_LEVEL=debug   - Everything

// ====== COMMON PATTERNS ======

// Pattern 1: Service operation
logger.info('Processing payment for order: 123');
try {
  // ... operation
  logger.info('✅ Payment processed successfully');
} catch (error) {
  logger.error('❌ Payment failed', error);
}

// Pattern 2: Database query
logger.debug('Executing query', { query: 'SELECT * FROM users' });
const users = await db.query();
logger.debug(`Retrieved ${users.length} users`);

// Pattern 3: API request
logger.info(`Request: ${method} ${url}`);
const response = await fetch(url);
logger.info(`Response: ${response.status}`);

// Pattern 4: Validation
if (!email) {
  logger.warn('Email validation failed', { email, userId });
  throw new Error('Invalid email');
}

// ====== DO's & DON'Ts ======

✅ DO:
- Use appropriate levels (error for errors, info for business logic)
- Include context: logger.info('User login', { userId, timestamp })
- Log at operation boundaries (start, success, failure)
- Use stack traces for errors

❌ DON'T:
- Log passwords, tokens, or sensitive data
- Use console.log (use logger instead)
- Log inside tight loops
- Log at wrong level (avoid logger.info in debug code)

// ====== TROUBLESHOOTING ======

// Logs not appearing?
LOG_LEVEL=debug npm run dev    // More verbose

// Too many logs?
LOG_LEVEL=warn npm run dev     // Less verbose

// Check file permissions
ls -la logs/                   // View permissions
chmod 755 logs/                // Fix if needed

// View logs in real-time
tail -f logs/combined.log      // All logs
tail -f logs/error.log         // Errors only

// ====== INTEGRATION NOTES ======

// ✅ Already integrated in:
// - src/index.ts (server startup)
// - src/database/mongodb.ts (DB events)
// - src/middleware/requestLogger.middleware.ts (HTTP requests)
// - src/utils/logger.ts (logger config)

// 🔄 Integration needed in:
// - src/services/*.ts (business logic)
// - src/controllers/*.ts (request handling)
// - src/repositories/*.ts (data access)
// - Custom error handlers

// ====== FILES & DIRECTORIES ======

// Logger configuration:
// src/utils/logger.ts

// Request logger middleware:
// src/middleware/requestLogger.middleware.ts

// Log output directory:
// logs/
// ├── combined.log
// ├── error.log
// ├── http.log
// ├── exceptions.log
// └── rejections.log

// Documentation:
// LOGGER_GUIDE.md (comprehensive guide)
// LOGGER_SETUP.md (setup summary)
// src/utils/logger.examples.ts (code examples)

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  💡 TIP: Use logger instead of console.log for better organization    ║
// ║  📊 TIP: Logs are automatically stored for audit trails               ║
// ║  🎯 TIP: Different log files for different purposes                   ║
// ╚════════════════════════════════════════════════════════════════════════╝
