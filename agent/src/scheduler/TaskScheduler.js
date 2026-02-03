const cron = require('node-cron');

/**
 * Task Scheduler
 * 
 * Schedules periodic agent tasks using cron expressions
 */
class TaskScheduler {
    constructor(agent) {
        this.agent = agent;
        this.jobs = new Map();
        this.isRunning = false;
    }

    /**
     * Schedule a recurring task
     */
    schedule(name, cronExpression, taskConfig) {
        if (this.jobs.has(name)) {
            console.log(`[Scheduler] Job '${name}' already exists, stopping previous`);
            this.jobs.get(name).stop();
        }

        // Validate cron expression
        if (!cron.validate(cronExpression)) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }

        const job = cron.schedule(cronExpression, () => {
            console.log(`[Scheduler] Triggering job: ${name}`);
            this.agent.queueTask({
                type: taskConfig.type,
                data: taskConfig.data || {},
                priority: taskConfig.priority || 'medium'
            });
        }, {
            scheduled: this.isRunning
        });

        this.jobs.set(name, {
            job,
            cronExpression,
            taskConfig,
            createdAt: new Date()
        });

        console.log(`[Scheduler] Scheduled job: ${name} (${cronExpression})`);
    }

    /**
     * Start all scheduled jobs
     */
    start() {
        this.isRunning = true;
        this.jobs.forEach(({ job }, name) => {
            job.start();
            console.log(`[Scheduler] Started job: ${name}`);
        });
        console.log('[Scheduler] All jobs started');
    }

    /**
     * Stop all scheduled jobs
     */
    stop() {
        this.isRunning = false;
        this.jobs.forEach(({ job }, name) => {
            job.stop();
            console.log(`[Scheduler] Stopped job: ${name}`);
        });
        console.log('[Scheduler] All jobs stopped');
    }

    /**
     * Remove a scheduled job
     */
    unschedule(name) {
        if (this.jobs.has(name)) {
            this.jobs.get(name).job.stop();
            this.jobs.delete(name);
            console.log(`[Scheduler] Unscheduled job: ${name}`);
        }
    }

    /**
     * Get status of all jobs
     */
    getStatus() {
        const status = {};
        this.jobs.forEach(({ cronExpression, taskConfig, createdAt }, name) => {
            status[name] = {
                cronExpression,
                taskType: taskConfig.type,
                priority: taskConfig.priority,
                createdAt
            };
        });
        return {
            isRunning: this.isRunning,
            jobCount: this.jobs.size,
            jobs: status
        };
    }
}

module.exports = TaskScheduler;
