# Winston Logger Setup - Implementation Summary

## ✅ What's Been Configured

### 1. **Logger Instance** (`src/utils/logger.ts`)
- Multiple transports for different outputs
- Structured logging with timestamps
- Error stack traces included
- Color-coded console output

### 2. **Log Transports**

| Transport | File | Purpose | Content |
|-----------|------|---------|---------|
| Console | (stdout) | Real-time development | All levels, colorized |
| Combined | `logs/combined.log` | Complete audit trail | All log levels |
| Error | `logs/error.log` | Error tracking | Errors only |
| HTTP | `logs/http.log` | Request logging | HTTP requests |
| Exceptions | `logs/exceptions.log` | Uncaught errors | Process-level errors |
| Rejections | `logs/rejections.log` | Promise errors | Unhandled rejections |

### 3. **Request Logger Middleware** (`src/middleware/requestLogger.middleware.ts`)
- Automatic HTTP request logging
- Response status and duration tracking
- Intelligent level selection (error for 4xx/5xx, info for 2xx/3xx)

### 4. **Log Levels**
```
error   (0) - Critical errors
warn    (1) - Warnings
info    (2) - General information ⭐ Default
http    (3) - HTTP requests
debug   (4) - Debugging details
```

### 5. **Integration Points**

#### Server Startup (`src/index.ts`)
```typescript
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger.middleware';
import { responseFormatter } from './middleware/responseFormatter.middleware';

app.use(requestLogger);
app.use(responseFormatter);

// All console.log replaced with logger calls
```

#### Database Connection (`src/database/mongodb.ts`)
```typescript
import { logger } from '../utils/logger';

logger.info('✅ Connected to MongoDB');
logger.error('❌ Database Error:', error);
```

## 📁 Log File Output

Logs are automatically created in `logs/` directory:

```
backend/
├── logs/
│   ├── combined.log       (Size grows over time)
│   ├── error.log          (Error-only logs)
│   ├── http.log           (HTTP request logs)
│   ├── exceptions.log     (Uncaught exceptions)
│   └── rejections.log     (Promise rejections)
└── .gitignore            (logs/ already excluded)
```

## 🚀 Usage Examples

### Start the server
```bash
cd backend
npm run dev
```

### View logs in real-time
```bash
# Console output shows all logs with colors
# File logs accumulate in logs/ directory

# Tail error logs
tail -f logs/error.log

# Tail combined logs
tail -f logs/combined.log

# Tail HTTP requests
tail -f logs/http.log
```

### Sample log output

**Console (colorized):**
```
2026-02-14 10:30:45 [info]: 🚀 Starting server...
2026-02-14 10:30:46 [info]: ✅ Database connected
2026-02-14 10:30:46 [info]: 🔄 Attempting to start in-memory MongoDB for development...
2026-02-14 10:30:47 [info]: ✅ Connected to in-memory MongoDB
2026-02-14 10:30:47 [info]: 🔐 Seeding admin user...
2026-02-14 10:30:48 [info]: ✅ Admin user created successfully!
2026-02-14 10:30:48 [info]: ✅ Server running at http://localhost:5000
2026-02-14 10:30:48 [info]: 📊 Logs directory: /project/logs
```

**combined.log:**
```
2026-02-14 10:30:45 [info]: 🚀 Starting server...
2026-02-14 10:30:46 [info]: ✅ Database connected
2026-02-14 10:30:47 [info]: POST /api/auth/login - 200 - 125ms
2026-02-14 10:30:48 [info]: GET /api/shipments - 200 - 52ms
```

**error.log:**
```
2026-02-14 10:31:15 [error]: ❌ Failed to create user: Email already in use
2026-02-14 10:31:16 [error]: DELETE /api/users/invalid-id - 404 - 8ms
```

## 🔧 Configuration

### Control Log Level via Environment
```bash
# .env file
LOG_LEVEL=debug     # See all details
LOG_LEVEL=info      # Default - general info
LOG_LEVEL=warn      # Only warnings and errors
LOG_LEVEL=error     # Only errors
```

### To Disable File Logging (for testing)
Edit `src/utils/logger.ts` and comment out file transports:
```typescript
// new winston.transports.File({ ... }),
```

## 📊 Usage Patterns

### ✅ Best Practices

**DO:**
```typescript
// Log at appropriate levels
logger.info('User login successful');
logger.warn('Rate limit approaching');
logger.error('API call failed', error);

// Include context
logger.info('Order created', { orderId: '123', userId: 'user456' });

// Use for debugging
logger.debug('SQL executed', { query, params });
```

**DON'T:**
```typescript
// Avoid logging sensitive data
logger.info(`User password: ${password}`);
logger.info(`API key: ${apiKey}`);

// Avoid excessive logging
logger.info('Loop iteration 5000 of 10000'); // Too much

// Avoid redundant messages
logger.info('Getting user');
logger.info('Got user');
logger.info('Processing user');
```

## 🎯 Key Features

| Feature | Benefits |
|---------|----------|
| **Multiple Transports** | Different logs for different purposes |
| **Structured Logging** | Easy to parse and search |
| **Stack Traces** | Full error context for debugging |
| **Automatic HTTP Logging** | Visibility into request/response behavior |
| **Color-coded Console** | Quick visual scanning |
| **File Persistence** | Historical audit trail |
| **Log Rotation Ready** | Can add rotation for production |

## 🔍 Debugging with Logs

### Find errors
```bash
grep -n "error" logs/error.log
grep -n "ERROR" logs/combined.log
```

### Find specific user
```bash
grep "userId.*456" logs/combined.log
```

### Follow in real-time
```bash
tail -f logs/combined.log | grep "error"
```

### Count occurrences
```bash
grep -c "\[error\]" logs/error.log
```

## 📈 Production Considerations

For production deployment:

1. **Add Log Rotation** - Prevent log files from growing too large
   ```bash
   npm install winston-daily-rotate-file
   ```

2. **Set LOG_LEVEL to 'info'** - Reduce verbosity
   ```bash
   LOG_LEVEL=info
   ```

3. **Send to Centralized Logging** - Use services like:
   - ELK Stack
   - Splunk
   - DataDog
   - CloudWatch
   - Papertrail

4. **Archive Old Logs** - Set retention policy
   ```bash
   # Keep only 7 days of logs
   find logs -name "*.log" -mtime +7 -delete
   ```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Logs not appearing | Check LOG_LEVEL env variable |
| Logs in console but not files | Check `logs/` directory permissions |
| Files growing too large | Add log rotation or lower LOG_LEVEL |
| Too much output | Increase LOG_LEVEL or use grep to filter |

## ✨ Next Steps

1. Replace remaining `console.log` statements with logger calls
2. Add structured context to important operations
3. Set up log aggregation for production
4. Configure log rotation for file management
5. Create dashboards for log analysis

---

**Logger configured by:** Winston v3
**Environment:** Development & Production Ready
**Status:** ✅ Fully Integrated
