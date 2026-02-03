const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
const AgentLog = require('../models/AgentLog');
const AuditLog = require('../models/AuditLog');
const BatchInsight = require('../models/BatchInsight');

// @desc    Upload bulk results (CSV/JSON)
// @route   POST /api/admin/upload
// @access  Private (Admin)
exports.uploadResults = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const uploadBatchId = `BATCH-${Date.now()}`;
        const results = [];
        const errors = [];

        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        if (fileExtension === '.json') {
            // Parse JSON file
            const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
            for (const record of jsonData) {
                try {
                    const processed = await processRecord(record, uploadBatchId, req.user._id);
                    results.push(processed);
                } catch (err) {
                    errors.push({ record, error: err.message });
                }
            }
        } else if (fileExtension === '.csv') {
            // Parse CSV file
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', async (row) => {
                        try {
                            const processed = await processRecord(row, uploadBatchId, req.user._id);
                            results.push(processed);
                        } catch (err) {
                            errors.push({ record: row, error: err.message });
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid file format. Only CSV and JSON are supported.'
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Create audit log
        await AuditLog.createEntry({
            action: 'results_uploaded',
            category: 'data',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                description: `Uploaded ${results.length} results`,
                affectedRecords: results.length
            }
        });

        // Trigger agent for anomaly detection
        await AgentLog.create({
            taskType: 'anomaly_detection',
            status: 'pending',
            priority: 'high',
            triggeredBy: 'event',
            triggeredByUser: req.user._id,
            details: {
                inputData: { uploadBatchId, recordCount: results.length }
            }
        });

        res.status(200).json({
            success: true,
            message: `Uploaded ${results.length} results successfully`,
            data: {
                batchId: uploadBatchId,
                uploaded: results.length,
                errors: errors.length,
                errorDetails: errors
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading results',
            error: error.message
        });
    }
};

// Helper function to process each record
async function processRecord(record, uploadBatchId, uploadedBy) {
    // Find or validate student
    let student = await User.findOne({ studentId: record.studentId });

    if (!student) {
        throw new Error(`Student not found: ${record.studentId}`);
    }

    // Create exam result
    return await ExamResult.create({
        studentId: record.studentId,
        student: student._id,
        examId: record.examId,
        examName: record.examName,
        subjectCode: record.subjectCode,
        subjectName: record.subjectName,
        marks: {
            obtained: parseFloat(record.marksObtained),
            maximum: parseFloat(record.marksMaximum || 100)
        },
        grade: record.grade,
        credits: parseInt(record.credits || 3),
        semester: parseInt(record.semester),
        academicYear: record.academicYear,
        examDate: new Date(record.examDate),
        uploadBatchId,
        uploadedBy
    });
}

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
    try {
        const { department, batchYear, search, page = 1, limit = 20 } = req.query;

        const query = { role: 'student' };

        if (department) query['profile.department'] = department;
        if (batchYear) query['profile.batchYear'] = parseInt(batchYear);
        if (search) {
            query.$text = { $search: search };
        }

        const total = await User.countDocuments(query);
        const students = await User.find(query)
            .select('-password')
            .sort({ 'profile.lastName': 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: students.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// @desc    Get student details with results
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
exports.getStudentDetails = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');

        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const results = await ExamResult.find({ student: student._id })
            .sort({ semester: -1, examDate: -1 });

        const cgpa = await ExamResult.calculateCGPA(student.studentId);

        res.status(200).json({
            success: true,
            data: {
                student,
                cgpa,
                results,
                totalResults: results.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student details',
            error: error.message
        });
    }
};

// @desc    Get Agent logs
// @route   GET /api/admin/agent-logs
// @access  Private (Admin)
exports.getAgentLogs = async (req, res) => {
    try {
        const { taskType, status, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {};

        if (taskType) query.taskType = taskType;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const total = await AgentLog.countDocuments(query);
        const logs = await AgentLog.find(query)
            .populate('triggeredByUser', 'email profile.firstName profile.lastName')
            .populate('groundedBy', 'email profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching agent logs',
            error: error.message
        });
    }
};

// @desc    Get batch insights
// @route   GET /api/admin/insights
// @access  Private (Admin)
exports.getBatchInsights = async (req, res) => {
    try {
        const { academicYear, insightType, severity, page = 1, limit = 10 } = req.query;

        const query = {};

        if (academicYear) query['scope.academicYear'] = academicYear;
        if (insightType) query.insightType = insightType;
        if (severity) query.severity = severity;

        const total = await BatchInsight.countDocuments(query);
        const insights = await BatchInsight.find(query)
            .populate('acknowledgedBy', 'email profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: insights.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching insights',
            error: error.message
        });
    }
};

// @desc    Acknowledge insight
// @route   PUT /api/admin/insights/:id/acknowledge
// @access  Private (Admin)
exports.acknowledgeInsight = async (req, res) => {
    try {
        const insight = await BatchInsight.findByIdAndUpdate(
            req.params.id,
            {
                acknowledgedBy: req.user._id,
                acknowledgedAt: new Date()
            },
            { new: true }
        );

        if (!insight) {
            return res.status(404).json({
                success: false,
                message: 'Insight not found'
            });
        }

        res.status(200).json({
            success: true,
            data: insight
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error acknowledging insight',
            error: error.message
        });
    }
};
