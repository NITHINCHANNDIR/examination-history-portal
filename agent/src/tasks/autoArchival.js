const mongoose = require('mongoose');

/**
 * Auto-Archival Task
 * 
 * Archives records older than configured threshold:
 * - Moves old records to archived state
 * - Maintains searchability via indexes
 * - Generates archival reports
 */
async function autoArchival(data, config) {
    const ExamResult = mongoose.model('ExamResult');

    console.log('[Auto-Archival] Starting archival process...');

    const archivalYears = config.archivalYears || 5;
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - archivalYears);

    console.log(`[Auto-Archival] Archiving records older than: ${cutoffDate.toISOString()}`);

    // Find records to archive
    const recordsToArchive = await ExamResult.find({
        isArchived: false,
        examDate: { $lt: cutoffDate }
    }).limit(config.batchSize || 500);

    if (recordsToArchive.length === 0) {
        console.log('[Auto-Archival] No records to archive');
        return {
            recordsArchived: 0,
            cutoffDate: cutoffDate.toISOString(),
            message: 'No records met archival criteria'
        };
    }

    // Archive records
    const recordIds = recordsToArchive.map(r => r._id);
    const archivedAt = new Date();

    const result = await ExamResult.updateMany(
        { _id: { $in: recordIds } },
        {
            $set: {
                isArchived: true,
                archivedAt
            }
        }
    );

    // Group by academic year for reporting
    const yearCounts = {};
    recordsToArchive.forEach(r => {
        yearCounts[r.academicYear] = (yearCounts[r.academicYear] || 0) + 1;
    });

    console.log(`[Auto-Archival] Archived ${result.modifiedCount} records`);

    return {
        recordsArchived: result.modifiedCount,
        cutoffDate: cutoffDate.toISOString(),
        archivedAt: archivedAt.toISOString(),
        byAcademicYear: yearCounts,
        oldestRecord: recordsToArchive.reduce((oldest, r) =>
            !oldest || r.examDate < oldest.examDate ? r : oldest, null
        )?.examDate
    };
}

module.exports = autoArchival;
