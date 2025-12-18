const cron = require('node-cron');
const axios = require('axios');

/**
 * ============================================================================
 * RECURRING TRANSACTIONS CRON SCHEDULER
 * ============================================================================
 *
 * PURPOSE:
 * This file sets up scheduled jobs (cron jobs) that automatically process
 * recurring transactions daily. It calls the processRecurringTransactions
 * endpoint at midnight to generate due expenses and incomes.
 *
 * WHAT IS A CRON JOB?
 * A cron job is a time-based scheduler that automatically runs tasks at
 * specified intervals. The term comes from Unix "cron" daemon.
 *
 * CRON SYNTAX (for reference):
 * ```
 * * * * * * *
 * | | | | | |
 * | | | | | day of week (0-7, 0 and 7 are Sunday)
 * | | | | month (1-12)
 * | | | day of month (1-31)
 * | | hour (0-23)
 * | minute (0-59)
 * second (0-59, optional)
 * ```
 *
 * EXAMPLES:
 * - '0 0 * * *'       - Every day at midnight (00:00)
 * - '0 *\/6 * * *'    - Every 6 hours (escaped asterisk-slash)
 * - '30 2 * * *'      - Every day at 2:30 AM
 * - '0 0 1 * *'       - First day of every month at midnight
 * - '0 9 * * 1'       - Every Monday at 9:00 AM
 *
 * WHY USE node-cron INSTEAD OF SYSTEM CRON?
 *
 * Option A: System Cron (Linux/Unix crontab)
 * Pros: OS-level, very reliable, runs even if app restarts
 * Cons: Requires server access, platform-specific, harder to deploy
 *
 * Option B: node-cron (CHOSEN)
 * Pros: Portable, easy to configure, no server access needed, works anywhere
 * Cons: Stops if app crashes, single-server limitation
 *
 * Option C: Cloud Schedulers (AWS EventBridge, Google Cloud Scheduler)
 * Pros: Most reliable, multi-server support, built-in retries
 * Cons: Requires cloud infrastructure, costs money, more complex
 *
 * DECISION: node-cron for MVP/demo, would upgrade to cloud scheduler for production
 *
 * ARCHITECTURE DECISIONS:
 *
 * 1. HTTP CALL vs DIRECT FUNCTION CALL:
 *    Why HTTP: Uses existing API endpoint, respects middleware (auth, logging)
 *    Alternative: Import controller function directly
 *    Tradeoff: Slight overhead vs consistency with API architecture
 *
 * 2. SCHEDULING TIME:
 *    Chosen: Midnight (00:00) daily
 *    Why: Standard time for daily batch jobs, least user activity
 *    Alternative: Stagger by timezone, run hourly
 *
 * 3. ERROR HANDLING:
 *    Strategy: Log errors, continue running (don't crash app)
 *    Why: One failed run shouldn't stop future runs
 *    Production addition: Alert system, retry logic
 *
 * 4. LOCALHOST URL:
 *    Why: Cron runs on same server as API
 *    Production: Use environment variable for URL flexibility
 *
 * SCALING CONSIDERATIONS:
 *
 * For production with millions of users:
 * 1. Use job queue (Bull, BullMQ) instead of direct processing
 * 2. Implement worker pools for parallel processing
 * 3. Add circuit breakers to prevent cascade failures
 * 4. Use distributed locks to prevent duplicate processing
 * 5. Monitor job success/failure rates
 * 6. Implement exponential backoff for retries
 *
 * INTERVIEW TALKING POINTS:
 *
 * Q: Why run daily instead of real-time?
 * A: Batch processing is more efficient. Running at midnight:
 *    - Processes all users at once (better database performance)
 *    - Predictable timing for users (know when transactions appear)
 *    - Lower server load (not checking on every request)
 *    - Simpler debugging (clear processing window)
 *
 * Q: What if server restarts at midnight?
 * A: Short-term: Cron restarts with app, missed run catches up next day
 *    Production: Use persistent job queue that survives restarts
 *    Alternative: External scheduler that calls HTTP endpoint
 *
 * Q: How do you test cron jobs?
 * A: Multiple approaches:
 *    1. Manual trigger: Call /api/recurring/process directly
 *    2. Adjust schedule: Change to '* * * * *' (every minute) for testing
 *    3. Mock time: Use libraries like 'timekeeper' or 'sinon' fake timers
 *    4. Integration tests: Verify results after running processor
 *
 * Q: What about different timezones?
 * A: Current: Single timezone (server time)
 *    Enhancement: Store user timezone, process in batches per timezone
 *    Implementation: Run hourly, process users whose local time is midnight
 *
 * Q: How do you monitor cron job health?
 * A: Production monitoring:
 *    - Log every execution (start time, duration, results)
 *    - Track metrics (success rate, transactions created)
 *    - Alert on failures (email, Slack, PagerDuty)
 *    - Dashboard showing last successful run
 *    - Dead man's switch (alert if no run in 25 hours)
 */

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const CRON_SCHEDULE = '0 0 * * *';  // Every day at midnight

/**
 * Process recurring transactions via HTTP call
 *
 * Why HTTP instead of direct function call?
 * - Respects API middleware (auth, logging, error handling)
 * - Consistent with rest of architecture
 * - Easier to test (can call endpoint directly)
 * - Can be called by external schedulers (AWS EventBridge, etc.)
 *
 * Error Handling Strategy:
 * - Try-catch prevents cron from stopping on error
 * - Log error details for debugging
 * - Continue running for next scheduled time
 * - In production: Send alerts, retry failed jobs
 */
async function processRecurringTransactions() {
  try {
    console.log(`\n⏰ [${new Date().toISOString()}] Running recurring transactions processor...`);

    const response = await axios.post(`${API_BASE_URL}/api/recurring/process`, {}, {
      timeout: 30000  // 30 second timeout
    });

    if (response.data.success) {
      console.log(`✅ Recurring transactions processed successfully:`);
      console.log(`   - Expenses created: ${response.data.data.expensesCreated}`);
      console.log(`   - Incomes created: ${response.data.data.incomesCreated}`);
      console.log(`   - Total processed: ${response.data.data.totalProcessed}`);
    } else {
      console.error('❌ Recurring transaction processing failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Error processing recurring transactions:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    // Don't throw - let cron continue running
  }
}

/**
 * Initialize the cron scheduler
 *
 * Called when server starts to register all scheduled jobs
 *
 * CRON OPTIONS:
 * - scheduled: true (starts automatically)
 * - timezone: Optional, defaults to server timezone
 *
 * PRODUCTION ENHANCEMENTS:
 * 1. Add timezone configuration
 * 2. Make schedule configurable via environment variable
 * 3. Add multiple schedules (hourly health check, weekly cleanup, etc.)
 * 4. Implement graceful shutdown (stop accepting new jobs, finish running ones)
 */
function initializeScheduler() {
  console.log('📅 Initializing recurring transactions scheduler...');
  console.log(`   Schedule: ${CRON_SCHEDULE} (Daily at midnight)`);
  console.log(`   Target: ${API_BASE_URL}/api/recurring/process\n`);

  /**
   * Schedule: Every day at midnight (00:00)
   *
   * The cron.schedule function returns a ScheduledTask object
   * that can be used to:
   * - task.start() - Start the scheduled task
   * - task.stop() - Stop the scheduled task
   * - task.destroy() - Remove the task completely
   *
   * Options:
   * - scheduled: true - Task starts automatically
   * - timezone: 'America/New_York' - Optional timezone
   */
  const recurringTask = cron.schedule(CRON_SCHEDULE, processRecurringTransactions, {
    scheduled: true,
    timezone: 'Asia/Kolkata'  // Indian timezone for demo (Bangalore-based user)
  });

  /**
   * OPTIONAL: Add a test/development schedule
   *
   * Uncomment below to run every 2 minutes for testing
   * REMEMBER TO REMOVE THIS IN PRODUCTION!
   */
  /*
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 DEV MODE: Adding test schedule (every 2 minutes)');
    cron.schedule('*\/2 * * * *', async () => {
      console.log('\n🧪 [DEV] Running test recurring processor...');
      await processRecurringTransactions();
    }, { scheduled: true });
  }
  */

  /**
   * OPTIONAL: Health check cron (runs every 6 hours)
   *
   * Verifies cron is still running and logs status
   * Useful for monitoring in production
   */
  cron.schedule('0 */6 * * *', () => {
    console.log(`\n💚 [${new Date().toISOString()}] Cron health check: Scheduler is running`);
  }, { scheduled: true });

  console.log('✅ Recurring transactions scheduler initialized successfully\n');

  return recurringTask;
}

/**
 * Graceful shutdown handler
 *
 * Called when server is shutting down (SIGTERM, SIGINT)
 * Ensures running jobs complete before stopping
 *
 * In production, you'd:
 * 1. Stop accepting new jobs
 * 2. Wait for current jobs to finish (with timeout)
 * 3. Save state for resume on restart
 * 4. Close database connections
 */
function shutdownScheduler() {
  console.log('🛑 Shutting down recurring transactions scheduler...');
  // Cron tasks automatically stop when process exits
  // For more control, store task reference and call task.stop()
}

// Export functions
module.exports = {
  initializeScheduler,
  shutdownScheduler,
  processRecurringTransactions  // Export for manual testing
};

/**
 * ============================================================================
 * ADDITIONAL INTERVIEW QUESTIONS & ANSWERS
 * ============================================================================
 *
 * Q: How would you handle a scenario where processing takes longer than the schedule interval?
 * A: Multiple strategies:
 *    1. **Locking mechanism**: Use distributed lock (Redis) to prevent overlapping runs
 *    2. **Task queue**: Use Bull/BullMQ with concurrency=1
 *    3. **Status flag**: Check if previous run is still processing before starting new one
 *    4. **Increase interval**: If processing takes 10 min, don't run every 5 min
 *    Example implementation:
 *    ```javascript
 *    let isProcessing = false;
 *    cron.schedule('* * * * *', async () => {
 *      if (isProcessing) {
 *        console.log('Previous run still processing, skipping...');
 *        return;
 *      }
 *      isProcessing = true;
 *      try {
 *        await processRecurringTransactions();
 *      } finally {
 *        isProcessing = false;
 *      }
 *    });
 *    ```
 *
 * Q: What's the difference between cron.schedule and setInterval?
 * A: Key differences:
 *    - **Cron**: Calendar-based ("at midnight"), DST-aware, misses runs if system sleeps
 *    - **setInterval**: Duration-based ("every 86400000ms"), not DST-aware, continuous
 *    - **Use cron for**: Daily reports, monthly billing, specific times
 *    - **Use setInterval for**: Polling, heartbeats, real-time monitoring
 *
 * Q: How do you prevent duplicate transaction generation?
 * A: Four-layer approach:
 *    1. **nextDate checkpoint**: Only process where nextDate <= today
 *    2. **Immediate update**: Update nextDate in same transaction as creation
 *    3. **Unique constraint**: Database constraint on (recurringId, date)
 *    4. **Idempotency check**: Before creating, verify transaction doesn't exist
 *
 * Q: How would you implement priority for recurring transactions?
 * A: Add priority field and process in order:
 *    ```javascript
 *    // Schema addition
 *    priority: Int @default(0)  // Higher = more important
 *
 *    // Processing query
 *    const dueExpenses = await prisma.recurringExpense.findMany({
 *      where: { isActive: true, nextDate: { lte: today } },
 *      orderBy: [
 *        { priority: 'desc' },  // High priority first
 *        { nextDate: 'asc' }    // Then oldest first
 *      ]
 *    });
 *    ```
 *    Use cases: Salary before rent, critical subscriptions first
 *
 * Q: How do you handle partial failures (some transactions created, some failed)?
 * A: Transaction rollback strategy:
 *    ```javascript
 *    await prisma.$transaction(async (tx) => {
 *      // Create expense
 *      const expense = await tx.expense.create({...});
 *
 *      // Update recurring template
 *      await tx.recurringExpense.update({...});
 *
 *      // If any step fails, entire transaction rolls back
 *    });
 *    ```
 *    Alternative: Individual transactions + cleanup job for orphaned records
 *
 * Q: What metrics would you track for this feature?
 * A: Key metrics:
 *    1. **Processing metrics**:
 *       - Cron execution time (avg, p95, p99)
 *       - Success/failure rate
 *       - Transactions created per run
 *    2. **Business metrics**:
 *       - Active recurring templates count
 *       - Most common frequencies
 *       - Auto-generated transactions %
 *    3. **User metrics**:
 *       - Users with recurring transactions
 *       - Average recurring templates per user
 *       - Pause/resume frequency
 *    4. **Health metrics**:
 *       - Time since last successful run
 *       - Error rate trends
 *       - Database query performance
 *
 * Q: How would you implement "skip next occurrence" feature?
 * A: Add a skip mechanism:
 *    ```javascript
 *    // Schema addition
 *    skipNext: Boolean @default(false)
 *
 *    // Processing logic
 *    if (recurring.skipNext) {
 *      // Don't create transaction, just update nextDate
 *      const nextDate = calculateNextDate(recurring.nextDate, recurring.frequency);
 *      await prisma.recurringExpense.update({
 *        where: { id: recurring.id },
 *        data: { nextDate, skipNext: false }  // Reset skip flag
 *      });
 *      continue;
 *    }
 *    ```
 *    Use case: "I'm traveling next month, skip my gym payment"
 *
 * Q: How do you handle database connection failures during cron execution?
 * A: Multi-layer resilience:
 *    1. **Retry logic**: Exponential backoff (try 3 times with delays)
 *    2. **Circuit breaker**: Stop trying after repeated failures
 *    3. **Dead letter queue**: Store failed jobs for later processing
 *    4. **Alerting**: Notify team of persistent failures
 *    5. **Graceful degradation**: Log failure, continue to next user
 *    Example:
 *    ```javascript
 *    async function processWithRetry(fn, retries = 3) {
 *      for (let i = 0; i < retries; i++) {
 *        try {
 *          return await fn();
 *        } catch (error) {
 *          if (i === retries - 1) throw error;
 *          await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
 *        }
 *      }
 *    }
 *    ```
 *
 * ============================================================================
 */
