# Winston Logger Configuration & Usage Guide

## Overview
The application uses Winston for structured logging with multiple transports and log levels.

## Log Levels
- **error** (0): Application errors and exceptions
- **warn** (1): Warning messages
- **info** (2): General informational messages
- **http** (3): HTTP request/response logging
- **debug** (4): Detailed debugging information

## Log Outputs

### Console Transport
- **All levels** with color coding for quick identification
- Real-time output for development debugging

### File Transports

#### `logs/combined.log`
- All log levels combined
- Includes timestamps and full error stack traces
- Useful for full audit trail

#### `logs/error.log`
- Error level logs only
- Critical for production monitoring
- Full stack traces included

#### `logs/http.log`
- HTTP request/response logging
- Performance metrics (response time)
- Status codes included

#### `logs/exceptions.log`
- Uncaught exceptions
- Process-level errors

#### `logs/rejections.log`
- Unhandled promise rejections
- Async error tracking

## Usage Examples

### Basic Logging

```typescript
import { logger } from './utils/logger';

// Info level
logger.info('User logged in successfully');

// Warning level
logger.warn('Rate limit approaching');

// Error level with context
logger.error('Failed to process payment', { orderId: '123', error: err });

// Debug level
logger.debug('Database query executed', { query: 'SELECT * FROM users' });
```

### In Services

```typescript
import { logger } from '../utils/logger';

export class UserService {
  async createUser(data: any) {
    try {
      logger.info(`Creating user with email: ${data.email}`);
      const user = await userRepository.create(data);
      logger.info(`User created successfully with ID: ${user._id}`);
      return user;
    } catch (error) {
      logger.error(`Failed to create user: ${error.message}`, error);
      throw error;
    }
  }
}
```

### In Controllers

```typescript
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      logger.info(`Login attempt for email: ${req.body.email}`);
      // ... login logic
      logger.info(`Login successful for user: ${user._id}`);
      return res.json({ success: true, data: user });
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Login failed' });
    }
  }
}
```

### HTTP Request Logging (Automatic)

The `requestLogger` middleware automatically logs all HTTP requests:

```
2026-02-14 15:30:45 [info]: POST /api/auth/login - 200 - 125ms
2026-02-14 15:30:46 [info]: GET /api/shipments - 200 - 52ms
2026-02-14 15:30:47 [error]: DELETE /api/users/invalid-id - 404 - 8ms
```

## Environment Variables

Control logging behavior with environment variables:

```bash
# Set log level (error, warn, info, http, debug)
LOG_LEVEL=info

# Default is 'info' if not specified
```

## Log File Locations

All logs are stored in the `logs/` directory at the project root:

```
project-root/
├── logs/
│   ├── combined.log        # All logs
│   ├── error.log           # Errors only
│   ├── http.log            # HTTP requests
│   ├── exceptions.log      # Uncaught exceptions
│   └── rejections.log      # Promise rejections
```

## Best Practices

1. **Use appropriate levels**: Don't log everything as info
2. **Include context**: Add relevant IDs and data with errors
3. **Avoid sensitive data**: Never log passwords, tokens, or PII
4. **Use structured data**: Include objects for better tracking

```typescript
// ✅ Good
logger.info('User action', { userId: '123', action: 'login' });

// ❌ Wrong
logger.info(`User ${user.email} logged in with password ${password}`);
```

5. **Chain errors**: Provide error context through the call stack

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { 
    operation: 'riskyOperation',
    error: error.message,
    userId: req.user?.id 
  });
}
```

## Rotating Logs (Optional)

For production, consider adding log rotation:

```bash
npm install winston-daily-rotate-file
```

Then add to logger configuration:

```typescript
import DailyRotateFile from 'winston-daily-rotate-file';

new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
})
```

## Integration with Monitoring Tools

The structured JSON format allows easy integration with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- DataDog
- CloudWatch
- New Relic

## Troubleshooting

### Logs not appearing in files
- Check `logs/` directory exists or will be created on first run
- Verify file permissions
- Check `LOG_LEVEL` environment variable

### Too many logs
- Increase `LOG_LEVEL` to reduce verbosity
- Consider using `maxFiles` with log rotation

### Performance concerns
- File I/O happens asynchronously
- Consider disabling file transport in development if needed
- Use `maxSize` to prevent log files from growing too large
