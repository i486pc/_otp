import schedule from 'node-schedule';
import { runScheduledTasks } from './scheduled-tasks.js';

console.log('Starting OTP system scheduler...');

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

console.log('Scheduler started. Press Ctrl+C to exit.');

// Handle graceful shutdown
process.on('SIGINT', function() {
  console.log('Shutting down scheduler...');
  cleanupJob.cancel();
  midnightJob.cancel();
  console.log('Scheduler stopped');
  process.exit(0);
});