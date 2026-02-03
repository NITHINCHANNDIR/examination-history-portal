const mongoose = require('mongoose');

/**
 * Batch Insights Generation
 * 
 * Automatically generates analytics:
 * - Failure rate analysis by module
 * - Grade distribution summaries
 * - Trend comparisons across semesters
 */
async function batchInsights(data, config) {
    const ExamResult = mongoose.model('ExamResult');
    const BatchInsight = mongoose.model('BatchInsight');

    console.log('[Batch Insights] Generating insights...');

    const { academicYear, semester } = data || {};
    const insights = [];

    // Get unique academic years if not specified
    const years = academicYear
        ? [academicYear]
        : await ExamResult.distinct('academicYear', { isArchived: false });

    for (const year of years) {
        const yearQuery = { academicYear: year, isArchived: false };
        if (semester) yearQuery.semester = semester;

        // 1. Failure Rate Analysis
        const subjects = await ExamResult.distinct('subjectCode', yearQuery);

        for (const subjectCode of subjects) {
            const subjectResults = await ExamResult.find({
                ...yearQuery,
                subjectCode
            });

            if (subjectResults.length < 5) continue;

            const failCount = subjectResults.filter(r => r.grade === 'F').length;
            const failRate = (failCount / subjectResults.length) * 100;

            // Alert if failure rate > 30%
            if (failRate > 30) {
                const insight = await BatchInsight.create({
                    insightType: 'failure_rate_alert',
                    scope: {
                        academicYear: year,
                        semester: subjectResults[0].semester,
                        subjectCode
                    },
                    data: {
                        summary: `High failure rate of ${failRate.toFixed(1)}% in ${subjectResults[0].subjectName}`,
                        statistics: {
                            totalStudents: subjectResults.length,
                            failedStudents: failCount,
                            failureRate: failRate
                        },
                        recommendations: [
                            'Review examination difficulty level',
                            'Analyze teaching methodology',
                            'Consider additional support sessions'
                        ]
                    },
                    severity: failRate > 50 ? 'critical' : 'high',
                    isActionRequired: true
                });
                insights.push(insight);
            }
        }

        // 2. Grade Distribution by Semester
        const semesters = await ExamResult.distinct('semester', yearQuery);

        for (const sem of semesters) {
            const semResults = await ExamResult.find({
                ...yearQuery,
                semester: sem
            });

            const gradeCount = {};
            semResults.forEach(r => {
                gradeCount[r.grade] = (gradeCount[r.grade] || 0) + 1;
            });

            const total = semResults.length;
            const distribution = {};
            Object.entries(gradeCount).forEach(([grade, count]) => {
                distribution[grade] = ((count / total) * 100).toFixed(1);
            });

            const insight = await BatchInsight.create({
                insightType: 'grade_distribution',
                scope: {
                    academicYear: year,
                    semester: sem
                },
                data: {
                    summary: `Grade distribution for Semester ${sem} (${year})`,
                    statistics: {
                        totalResults: total,
                        gradeDistribution: distribution
                    },
                    percentages: distribution
                },
                severity: 'low'
            });
            insights.push(insight);
        }

        // 3. Subject Comparison
        const subjectStats = {};
        for (const subjectCode of subjects) {
            const results = await ExamResult.find({ ...yearQuery, subjectCode });
            if (results.length === 0) continue;

            const avgMarks = results.reduce((sum, r) => sum + r.marks.percentage, 0) / results.length;
            subjectStats[subjectCode] = {
                name: results[0].subjectName,
                avgMarks: avgMarks.toFixed(2),
                totalStudents: results.length
            };
        }

        // Find top and bottom performing subjects
        const sortedSubjects = Object.entries(subjectStats)
            .sort((a, b) => parseFloat(b[1].avgMarks) - parseFloat(a[1].avgMarks));

        if (sortedSubjects.length >= 2) {
            const insight = await BatchInsight.create({
                insightType: 'subject_comparison',
                scope: { academicYear: year },
                data: {
                    summary: `Subject performance comparison for ${year}`,
                    statistics: {
                        topPerformers: sortedSubjects.slice(0, 3).map(([code, stats]) => ({
                            code, ...stats
                        })),
                        bottomPerformers: sortedSubjects.slice(-3).map(([code, stats]) => ({
                            code, ...stats
                        })),
                        overallAverage: (sortedSubjects.reduce((s, [, stats]) =>
                            s + parseFloat(stats.avgMarks), 0) / sortedSubjects.length
                        ).toFixed(2)
                    }
                },
                severity: 'low'
            });
            insights.push(insight);
        }
    }

    console.log(`[Batch Insights] Generated ${insights.length} insights`);

    return {
        yearsAnalyzed: years.length,
        insightsGenerated: insights.length,
        insights: insights.map(i => ({
            type: i.insightType,
            summary: i.data.summary,
            severity: i.severity
        }))
    };
}

module.exports = batchInsights;
