const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Integrity Verification Task
 * 
 * Cross-references digital signatures on historical records:
 * - Detects tampering attempts
 * - Generates integrity reports
 * - Alerts on verification failures
 */
async function integrityVerification(data, config) {
    const ExamResult = mongoose.model('ExamResult');
    const AgentLog = mongoose.model('AgentLog');

    console.log('[Integrity Verification] Starting verification...');

    const { batchId, force = false } = data || {};
    const violations = [];

    // Build query
    const query = { isArchived: false };
    if (batchId) query.uploadBatchId = batchId;
    if (!force) query.signatureVerified = false;

    const results = await ExamResult.find(query).limit(config.batchSize || 1000);

    console.log(`[Integrity Verification] Checking ${results.length} records...`);

    let verified = 0;
    let failed = 0;

    for (const result of results) {
        // Regenerate expected signature
        const signatureData = `${result.studentId}-${result.examId}-${result.subjectCode}-${result.marks.obtained}-${result.grade}`;
        const expectedSignature = crypto.createHash('sha256').update(signatureData).digest('hex');

        if (result.digitalSignature === expectedSignature) {
            // Signature valid
            await ExamResult.findByIdAndUpdate(result._id, {
                signatureVerified: true
            });
            verified++;
        } else {
            // Signature mismatch - potential tampering
            violations.push({
                resultId: result._id,
                studentId: result.studentId,
                examId: result.examId,
                subjectCode: result.subjectCode,
                expectedSignature: expectedSignature.substring(0, 16) + '...',
                actualSignature: (result.digitalSignature || 'none').substring(0, 16) + '...',
                discoveredAt: new Date()
            });

            // Add anomaly flag
            await ExamResult.findByIdAndUpdate(result._id, {
                signatureVerified: false,
                $push: {
                    anomalyFlags: {
                        type: 'integrity_violation',
                        description: 'Digital signature verification failed - possible tampering',
                        flaggedAt: new Date(),
                        flaggedBy: 'agent'
                    }
                }
            });

            failed++;
        }
    }

    console.log(`[Integrity Verification] Verified: ${verified}, Failed: ${failed}`);

    return {
        recordsChecked: results.length,
        verified,
        failed,
        violations: violations.map(v => ({
            studentId: v.studentId,
            examId: v.examId,
            subjectCode: v.subjectCode,
            discoveredAt: v.discoveredAt
        })),
        integrityRate: results.length > 0
            ? ((verified / results.length) * 100).toFixed(2) + '%'
            : 'N/A'
    };
}

module.exports = integrityVerification;
