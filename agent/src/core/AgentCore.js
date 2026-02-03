const EventEmitter = require('events');

/**
 * AntigravityAgent - Core orchestration engine for autonomous data processing
 * 
 * This agent runs as a worker process, handling:
 * - Anomaly detection in exam results
 * - Batch insights generation
 * - Integrity verification
 * - Auto-archival of old records
 */
class AntigravityAgent extends EventEmitter {
    constructor(options = {}) {
        super();

        this.isRunning = false;
        this.isGrounded = false;
        this.taskQueue = [];
        this.currentTask = null;
        this.stats = {
            tasksProcessed: 0,
            tasksSucceeded: 0,
            tasksFailed: 0,
            lastRunAt: null
        };

        // Configuration
        this.config = {
            anomalyThreshold: options.anomalyThreshold || 0.15,
            archivalYears: options.archivalYears || 5,
            batchSize: options.batchSize || 100,
            maxRetries: options.maxRetries || 3
        };

        // Task handlers map
        this.taskHandlers = new Map();
    }

    /**
     * Register a task handler
     */
    registerHandler(taskType, handler) {
        this.taskHandlers.set(taskType, handler);
        console.log(`[Agent] Registered handler for: ${taskType}`);
    }

    /**
     * Start the agent
     */
    start() {
        if (this.isRunning) {
            console.log('[Agent] Already running');
            return;
        }

        this.isRunning = true;
        this.isGrounded = false;
        console.log('[Agent] Antigravity Agent started');
        this.emit('started');

        // Process any queued tasks
        this.processQueue();
    }

    /**
     * Stop the agent gracefully
     */
    async stop() {
        console.log('[Agent] Stopping...');
        this.isRunning = false;

        // Wait for current task to complete
        if (this.currentTask) {
            console.log('[Agent] Waiting for current task to complete...');
            await this.currentTask;
        }

        console.log('[Agent] Stopped');
        this.emit('stopped');
    }

    /**
     * Ground the agent (Super Admin control)
     */
    ground(reason) {
        this.isGrounded = true;
        console.log(`[Agent] Grounded: ${reason}`);
        this.emit('grounded', { reason, timestamp: new Date() });
    }

    /**
     * Resume the agent
     */
    resume() {
        this.isGrounded = false;
        console.log('[Agent] Resumed');
        this.emit('resumed');

        if (this.isRunning) {
            this.processQueue();
        }
    }

    /**
     * Queue a task for processing
     */
    queueTask(task) {
        if (!this.taskHandlers.has(task.type)) {
            console.error(`[Agent] Unknown task type: ${task.type}`);
            return false;
        }

        const queuedTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...task,
            priority: task.priority || 'medium',
            retries: 0,
            queuedAt: new Date()
        };

        // Insert based on priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const insertIndex = this.taskQueue.findIndex(
            t => priorityOrder[t.priority] > priorityOrder[queuedTask.priority]
        );

        if (insertIndex === -1) {
            this.taskQueue.push(queuedTask);
        } else {
            this.taskQueue.splice(insertIndex, 0, queuedTask);
        }

        console.log(`[Agent] Task queued: ${queuedTask.id} (${task.type})`);
        this.emit('taskQueued', queuedTask);

        // Start processing if running
        if (this.isRunning && !this.currentTask && !this.isGrounded) {
            this.processQueue();
        }

        return queuedTask.id;
    }

    /**
     * Process the task queue
     */
    async processQueue() {
        if (!this.isRunning || this.isGrounded || this.currentTask) {
            return;
        }

        const task = this.taskQueue.shift();
        if (!task) {
            return;
        }

        this.currentTask = this.executeTask(task);
        await this.currentTask;
        this.currentTask = null;

        // Continue processing queue
        if (this.taskQueue.length > 0) {
            setImmediate(() => this.processQueue());
        }
    }

    /**
     * Execute a single task
     */
    async executeTask(task) {
        const handler = this.taskHandlers.get(task.type);
        const startTime = Date.now();

        console.log(`[Agent] Executing task: ${task.id} (${task.type})`);
        this.emit('taskStarted', task);

        try {
            const result = await handler(task.data, this.config);

            const duration = Date.now() - startTime;
            this.stats.tasksProcessed++;
            this.stats.tasksSucceeded++;
            this.stats.lastRunAt = new Date();

            console.log(`[Agent] Task completed: ${task.id} (${duration}ms)`);
            this.emit('taskCompleted', { task, result, duration });

            return { success: true, result, duration };

        } catch (error) {
            const duration = Date.now() - startTime;

            // Retry logic
            if (task.retries < this.config.maxRetries) {
                task.retries++;
                console.log(`[Agent] Task failed, retrying (${task.retries}/${this.config.maxRetries}): ${task.id}`);
                this.taskQueue.unshift(task);
                return { success: false, error: error.message, willRetry: true };
            }

            this.stats.tasksProcessed++;
            this.stats.tasksFailed++;

            console.error(`[Agent] Task failed permanently: ${task.id}`, error);
            this.emit('taskFailed', { task, error: error.message, duration });

            return { success: false, error: error.message, duration };
        }
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isGrounded: this.isGrounded,
            queueLength: this.taskQueue.length,
            hasCurrentTask: !!this.currentTask,
            stats: this.stats,
            config: this.config
        };
    }
}

module.exports = AntigravityAgent;
