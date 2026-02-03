require('dotenv').config();
const mongoose = require('mongoose');
const AntigravityAgent = require('./src/core/AgentCore');
const TaskScheduler = require('./src/scheduler/TaskScheduler');
const logger = require('./src/logger/AgentLogger');

// Import task handlers
const anomalyDetection = require('./src/tasks/anomalyDetection');
const batchInsights = require('./src/tasks/batchInsights');
const integrityVerification = require('./src/tasks/integrityVerification');
const autoArchival = require('./src/tasks/autoArchival');

// Import models (they need to be registered with mongoose)
require('../server/src/models/User');
require('../server/src/models/ExamResult');
require('../server/src/models/AgentLog');
require('../server/src/models/AuditLog');
require('../server/src/models/BatchInsight');

/**
 * Main entry point for the Antigravity Agent
 */
async function main() {
    logger.info('Starting Antigravity Agent...');

    // Connect to MongoDB
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examination-portal');
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Failed to connect to MongoDB', { error: error.message });
        process.exit(1);
    }

    // Initialize agent
    const agent = new AntigravityAgent({
        anomalyThreshold: parseFloat(process.env.ANOMALY_THRESHOLD) || 0.15,
        archivalYears: parseInt(process.env.ARCHIVAL_YEARS) || 5,
        batchSize: parseInt(process.env.BATCH_SIZE) || 100
    });

    // Register task handlers
    agent.registerHandler('anomaly_detection', anomalyDetection);
    agent.registerHandler('batch_insights', batchInsights);
    agent.registerHandler('integrity_verification', integrityVerification);
    agent.registerHandler('auto_archival', autoArchival);

    // Set up event listeners
    agent.on('started', () => logger.info('Agent started'));
    agent.on('stopped', () => logger.info('Agent stopped'));
    agent.on('grounded', ({ reason }) => logger.warn('Agent grounded', { reason }));
    agent.on('resumed', () => logger.info('Agent resumed'));

    agent.on('taskCompleted', ({ task, result, duration }) => {
        logger.info('Task completed', {
            taskId: task.id,
            type: task.type,
            duration,
            result: result ? Object.keys(result) : null
        });

        // Save to AgentLog
        saveAgentLog(task, 'completed', result, duration);
    });

    agent.on('taskFailed', ({ task, error, duration }) => {
        logger.error('Task failed', {
            taskId: task.id,
            type: task.type,
            error,
            duration
        });

        saveAgentLog(task, 'failed', { error }, duration);
    });

    // Initialize scheduler
    const scheduler = new TaskScheduler(agent);

    // Schedule recurring tasks
    // Run anomaly detection every hour
    scheduler.schedule('hourly-anomaly-scan', '0 * * * *', {
        type: 'anomaly_detection',
        priority: 'medium'
    });

    // Run batch insights daily at 2 AM
    scheduler.schedule('daily-insights', '0 2 * * *', {
        type: 'batch_insights',
        priority: 'low'
    });

    // Run integrity verification every 6 hours
    scheduler.schedule('integrity-check', '0 */6 * * *', {
        type: 'integrity_verification',
        priority: 'high'
    });

    // Run auto-archival weekly on Sunday at 3 AM
    scheduler.schedule('weekly-archival', '0 3 * * 0', {
        type: 'auto_archival',
        priority: 'low'
    });

    // Start the agent and scheduler
    agent.start();
    scheduler.start();

    logger.info('Antigravity Agent is running', {
        scheduledJobs: scheduler.getStatus().jobCount
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        scheduler.stop();
        await agent.stop();
        await mongoose.connection.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        logger.info('Shutting down...');
        scheduler.stop();
        await agent.stop();
        await mongoose.connection.close();
        process.exit(0);
    });
}

/**
 * Save agent task to database log
 */
async function saveAgentLog(task, status, result, duration) {
    try {
        const AgentLog = mongoose.model('AgentLog');
        await AgentLog.create({
            taskType: task.type,
            status,
            priority: task.priority,
            triggeredBy: 'scheduled',
            details: {
                inputData: task.data,
                outputData: result
            },
            metrics: {
                startTime: new Date(Date.now() - duration),
                endTime: new Date(),
                duration,
                recordsProcessed: result?.recordsChecked || result?.studentsAnalyzed || 0,
                anomaliesFound: result?.anomaliesFound || result?.failed || 0
            }
        });
    } catch (error) {
        logger.error('Failed to save agent log', { error: error.message });
    }
}

// Run the agent
main().catch(error => {
    logger.error('Fatal error', { error: error.message });
    process.exit(1);
});
