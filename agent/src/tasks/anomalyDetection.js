const mongoose = require('mongoose');

/**
 * Anomaly Detection Task
 * 
 * Scans exam results for suspicious patterns:
 * - Sudden performance spikes (e.g., 100% after consistent failures)
 * - Statistical outliers per batch/subject
 * - Impossible score patterns
 */
async function anomalyDetection(data, config) {
    const ExamResult = mongoose.model('ExamResult');
    const AgentLog = mongoose.model('AgentLog');

    console.log('[Anomaly Detection] Starting scan...');

    const anomalies = [];
    const { uploadBatchId, studentIds } = data || {};

    // Build query based on input
    const query = { isArchived: false };
    if (uploadBatchId) query.uploadBatchId = uploadBatchId;

    // Get all students to analyze
    const studentsToAnalyze = studentIds ||
        await ExamResult.distinct('studentId', query);

    for (const studentId of studentsToAnalyze) {
        const results = await ExamResult.find({ studentId })
            .sort({ examDate: 1 });

        if (results.length < 2) continue;

        // Check for sudden performance spikes
        for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];

            // Same subject comparison
            if (prev.subjectCode === curr.subjectCode) {
                const improvement = curr.marks.percentage - prev.marks.percentage;

                // Flag if improvement is > 40% in same subject
                if (improvement > 40) {
                    anomalies.push({
                        type: 'sudden_improvement',
                        studentId,
                        subjectCode: curr.subjectCode,
                        description: `Suspicious improvement: ${prev.marks.percentage.toFixed(1)}% → ${curr.marks.percentage.toFixed(1)}%`,
                        severity: improvement > 60 ? 'high' : 'medium',
                        resultId: curr._id
                    });
                }
            }

            // Check for impossible patterns (e.g., 100% after failing)
            if (prev.grade === 'F' && curr.marks.percentage === 100) {
                anomalies.push({
                    type: 'impossible_pattern',
                    studentId,
                    subjectCode: curr.subjectCode,
                    description: `Perfect score immediately after failing`,
                    severity: 'high',
                    resultId: curr._id
                });
            }
        }

        // Check for statistical outliers within a semester
        const semesterGroups = {};
        results.forEach(r => {
            const key = `${r.semester}-${r.academicYear}`;
            if (!semesterGroups[key]) semesterGroups[key] = [];
            semesterGroups[key].push(r);
        });

        for (const [semester, semResults] of Object.entries(semesterGroups)) {
            if (semResults.length < 3) continue;

            const percentages = semResults.map(r => r.marks.percentage);
            const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
            const stdDev = Math.sqrt(
                percentages.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / percentages.length
            );

            // Flag results more than 2.5 standard deviations from mean
            semResults.forEach(r => {
                if (stdDev > 0 && Math.abs(r.marks.percentage - avg) > 2.5 * stdDev) {
                    // Only flag if it's unusually high (not low)
                    if (r.marks.percentage > avg) {
                        anomalies.push({
                            type: 'statistical_outlier',
                            studentId,
                            subjectCode: r.subjectCode,
                            description: `Score ${r.marks.percentage.toFixed(1)}% is ${((r.marks.percentage - avg) / stdDev).toFixed(1)} std devs above semester average`,
                            severity: 'medium',
                            resultId: r._id
                        });
                    }
                }
            });
        }
    }

    // Update affected records with anomaly flags
    for (const anomaly of anomalies) {
        await ExamResult.findByIdAndUpdate(anomaly.resultId, {
            $push: {
                anomalyFlags: {
                    type: anomaly.type,
                    description: anomaly.description,
                    flaggedAt: new Date(),
                    flaggedBy: 'agent'
                }
            }
        });
    }

    console.log(`[Anomaly Detection] Found ${anomalies.length} anomalies`);

    return {
        studentsAnalyzed: studentsToAnalyze.length,
        anomaliesFound: anomalies.length,
        anomalies: anomalies.map(a => ({
            type: a.type,
            studentId: a.studentId,
            subjectCode: a.subjectCode,
            description: a.description,
            severity: a.severity
        }))
    };
}

module.exports = anomalyDetection;
