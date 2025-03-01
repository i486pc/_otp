# Scheduled Tasks Guide for OTP Authentication System

This document provides a comprehensive guide to the scheduled tasks implemented in the OTP Authentication System, including their purpose, implementation, and configuration options.

## Table of Contents

1. [Introduction to Scheduled Tasks](#introduction-to-scheduled-tasks)
2. [Types of Scheduled Tasks](#types-of-scheduled-tasks)
3. [Implementation Options](#implementation-options)
4. [Task Definitions](#task-definitions)
5. [Scheduling Configuration](#scheduling-configuration)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Error Handling](#error-handling)
8. [Integration with n8n](#integration-with-n8n)
9. [Best Practices](#best-practices)

## Introduction to Scheduled Tasks

Scheduled tasks are automated processes that run at specified intervals to perform maintenance, cleanup, and other routine operations. In the OTP Authentication System, scheduled tasks are essential for:

1. **Security**: Removing expired OTPs and resetting failed attempt counters
2. **Performance**: Cleaning up unused data to maintain database performance
3. **Maintenance**: Performing routine system maintenance
4. **Monitoring**: Collecting and reporting system metrics

## Types of Scheduled Tasks

The OTP Authentication System implements several types of scheduled tasks:

### Cleanup Tasks

- **Expired OTP Cleanup**: Removes OTPs that have expired
- **Failed Attempts Reset**: Resets failed attempt counters after a certain period

### Maintenance Tasks

- **Database Optimization**: Performs database maintenance operations
- **Log Rotation**: Manages log files to prevent excessive disk usage

### Monitoring Tasks

- **Health Check**: Verifies that all system components are functioning correctly
- **Usage Statistics**: Collects and reports system usage statistics

## Implementation Options

There are several ways to implement scheduled tasks in a Node.js application:

### 1. Built-in JavaScript Timers

Using `setInterval` or `setTimeout` for simple scheduling:

```javascript
// Run every 5 minutes
setInterval(async () => {
  try {
    await cleanupExpiredOtps();
  } catch (error) {
    console.error('Error in scheduled cleanup:', error);
  }
}, 5 * 60 * 1000);
```

**Pros**:
- Simple to implement
- No external dependencies
- Works in any JavaScript environment

**Cons**:
- Limited scheduling options
- No persistence across restarts
- No built-in error handling or retries

### 2. Node-Schedule Library

Using the `node-schedule` library for more complex scheduling:

```javascript
import schedule from 'node-schedule';

// Run every 5 minutes
const job = schedule.scheduleJob('*/5 * * * *', async function() {
  try {
    await cleanupExpiredOtps();
  } catch (error) {
    console.error('Error in scheduled cleanup:', error);
  }
});
```

**Pros**:
- Cron-like syntax for complex schedules
- More flexible than built-in timers
- Supports timezone-aware scheduling

**Cons**:
- External dependency
- No persistence across restarts
- Limited error handling and retries

### 3. External Scheduler (n8n)

Using n8n for workflow-based scheduling:

**Pros**:
- Visual workflow builder
- Built-in error handling and retries
- Persistence across restarts
- Comprehensive logging and monitoring
- Can integrate with other systems

**Cons**:
- Requires running a separate service
- More complex setup
- Additional resource usage

## Task Definitions

### Cleanup of Expired OTPs

This task removes OTPs that have expired from the database:

```javascript
export const cleanupExpiredOtps = async () => {
  try {
    const now = new Date().toISOString();
    
    // Delete expired OTPs
    const { data, error } = await supabase
      .from('_otp_codes')
      .delete()
      .lt('expires_at', now);
    
    if (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return { success: false, error };
    }
    
    console.log(`Cleaned up expired OTPs at ${new Date().toISOString()}`);
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in cleanupExpiredOtps:', error);
    return { success: false, error };
  }
};
```

### Reset of Failed Attempts

This task resets the failed attempt counters for users after a certain period:

```javascript
export const resetFailedAttempts = async () => {
  try {
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() - 24); // Reset attempts older than 24 hours
    
    // Update users with failed attempts older than the reset time
    const { data, error } = await supabase
      .from('_otp')
      .update({ failed_attempts: 0 })
      .lt('last_failed_attempt', resetTime.toISOString());
    
    if (error) {
      console.error('Error resetting failed attempts:', error);
      return { success: false, error };
    }
    
    console.log(`Reset failed attempts at ${new Date().toISOString()}`);
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in resetFailedAttempts:', error);
    return { success: false, error };
  }
};
```

### Running All Tasks

This function runs all scheduled tasks:

```javascript
export const runScheduledTasks = async () => {
  console.log('Running scheduled tasks...');
  
  // Run cleanup tasks
  await cleanupExpiredOtps();
  await resetFailedAttempts();
  
  console.log('Scheduled tasks completed');
};
```

## Scheduling Configuration

### Using Node-Schedule

```javascript
import schedule from 'node-schedule';
import { runScheduledTasks } from './scheduled-tasks.js';

// Run cleanup every 5 minutes
const cleanupJob = schedule.scheduleJob('*/5 * * * *', async function() {
  console.log('Running scheduled cleanup...');
  try {
    await runScheduledTasks();
    console.log('Scheduled cleanup completed successfully');
  } catch (error) {
    console.error('Error during scheduled cleanup:', error);
  }
});

// Run a more thorough cleanup at midnight
const midnightJob = schedule.scheduleJob('0 0 * * *', async function() {
  console.log('Running midnight cleanup...');
  try {
    await runScheduledTasks();
    console.log('Midnight cleanup completed successfully');
  } catch (error) {
    console.error('Error during midnight cleanup:', error);
  }
});
```

### Cron Syntax

Node-schedule uses cron syntax for scheduling:

- `* * * * *`: Every minute
- `*/5 * * * *`: Every 5 minutes
- `0 * * * *`: Every hour
- `0 0 * * *`: Every day at midnight
- `0 0 * * 0`: Every Sunday at midnight
- `0 0 1 * *`: First day of every month at midnight

### Running as a Separate Process

For better reliability, you can run the scheduler as a separate process:

```bash
# Start the scheduler
node src/server/scheduler.js

# Or using PM2
pm2 start src/server/scheduler.js --name "otp-scheduler"
```

## Monitoring and Logging

### Logging Task Execution

```javascript
console.log(`[${new Date().toISOString()}] Starting scheduled task: cleanupExpiredOtps`);
const result = await cleanupExpiredOtps();
console.log(`[${new Date().toISOString()}] Completed scheduled task: cleanupExpiredOtps`, result);
```

### Monitoring Task Performance

```javascript
const startTime = Date.now();
const result = await cleanupExpiredOtps();
const duration = Date.now() - startTime;
console.log(`Task completed in ${duration}ms, removed ${result.count} expired OTPs`);
```

### Alerting on Failures

```javascript
if (!result.success) {
  // Send alert via email, Slack, etc.
  await sendAlert({
    title: 'Scheduled Task Failed',
    message: `Task cleanupExpiredOtps failed: ${result.error}`,
    severity: 'high'
  });
}
```

## Error Handling

### ### Retry Logic

```javascript
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function runTaskWithRetry(taskFn, taskName) {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const result = await taskFn();
      return result;
    } catch (error) {
      retries++;
      console.error(`Task ${taskName} failed (attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries >= MAX_RETRIES) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}
```

### Graceful Shutdown

```javascript
// Handle graceful shutdown
process.on('SIGINT', function() {
  console.log('Shutting down scheduler...');
  cleanupJob.cancel();
  midnightJob.cancel();
  console.log('Scheduler stopped');
  process.exit(0);
});
```

## Integration with n8n

n8n can be used to create workflows for scheduled tasks, providing a visual interface for managing complex scheduling requirements.

### Creating an n8n Workflow for OTP Cleanup

1. **Create a new workflow** in n8n
2. **Add a Schedule trigger** node with the desired schedule (e.g., every 5 minutes)
3. **Add an HTTP Request node** to call the cleanup endpoint:
   - Method: POST
   - URL: `http://your-api-url/api/admin/cleanup`
   - Headers: `Content-Type: application/json`
   - Authentication: Basic Auth or API Key
4. **Add an IF node** to check if the cleanup was successful:
   - Condition: `{{$json["success"]}} === true`
5. **Add notification nodes** (e.g., Slack, Email) for success and failure cases

### Benefits of Using n8n for Scheduling

1. **Visual Interface**: Easy to understand and modify
2. **Error Handling**: Built-in error handling and retries
3. **Notifications**: Easy integration with notification services
4. **Monitoring**: Built-in execution history and logs
5. **Flexibility**: Can be combined with other workflows

## Best Practices

1. **Idempotency**: Ensure tasks can be run multiple times without side effects
2. **Atomicity**: Make tasks atomic to avoid partial execution
3. **Isolation**: Isolate tasks from each other to prevent cascading failures
4. **Monitoring**: Monitor task execution and performance
5. **Logging**: Log task execution details for troubleshooting
6. **Error Handling**: Implement robust error handling and retries
7. **Resource Management**: Be mindful of resource usage during task execution
8. **Graceful Shutdown**: Handle process termination gracefully
9. **Testing**: Test tasks thoroughly before deploying to production
10. **Documentation**: Document task purpose, behavior, and configuration