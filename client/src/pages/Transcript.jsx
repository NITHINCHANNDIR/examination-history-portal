import { useState, useRef } from 'react';
import { GraduationCap, Download, Printer, ShieldCheck, Share2 } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

// Mock Data for Transcript (since we don't have a dedicated endpoint yet)
// In a real app, we would fetch this from an API
const MOCK_TRANSCRIPT_DATA = {
    university: "Institute of Technology & Science",
    address: "123 Academic Avenue, Knowledge City, State - 500001",
    issueDate: "October 16, 2025",
    semesters: [
        {
            sem: 1,
            year: "2023-2024",
            credits: 24,
            sgpa: 9.2,
            subjects: [
                { code: "ENG101", name: "Engineering Mathematics I", credits: 4, grade: "A+" },
                { code: "PHY101", name: "Engineering Physics", credits: 4, grade: "A" },
                { code: "CS101", name: "Introduction to Programming", credits: 4, grade: "O" },
                { code: "EE101", name: "Basic Electrical Engineering", credits: 3, grade: "A" },
                { code: "ME101", name: "Engineering Graphics", credits: 3, grade: "A+" },
                { code: "HU101", name: "Communication Skills", credits: 2, grade: "A" },
            ]
        },
        {
            sem: 2,
            year: "2023-2024",
            credits: 24,
            sgpa: 9.4,
            subjects: [
                { code: "ENG102", name: "Engineering Mathematics II", credits: 4, grade: "O" },
                { code: "CHE101", name: "Engineering Chemistry", credits: 4, grade: "A+" },
                { code: "CS102", name: "Data Structures", credits: 4, grade: "O" },
                { code: "EC101", name: "Basic Electronics", credits: 3, grade: "A" },
                { code: "ME102", name: "Workshop Practice", credits: 2, grade: "O" },
            ]
        }
    ]
};

const Transcript = () => {
    const { user } = useAuthStore();
    const transcriptRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="no-print" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Official Transcript
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Digital record of your academic achievements.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ gap: '8px' }}>
                        <Share2 size={18} /> Share
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '8px' }}>
                        {isPrinting ? <Printer size={18} className="animate-pulse" /> : <Download size={18} />}
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Transcript Paper */}
            <div
                ref={transcriptRef}
                className="card"
                style={{
                    padding: '60px',
                    borderRadius: '4px',
                    minHeight: '1123px', // A4 Approx Height
                    position: 'relative',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    background: 'var(--color-card-bg, white)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Watermark */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    fontSize: '120px',
                    fontWeight: 900,
                    color: 'rgba(0,0,0,0.02)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    OFFICIAL COPY
                </div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <GraduationCap size={32} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                                {MOCK_TRANSCRIPT_DATA.university}
                            </h2>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                {MOCK_TRANSCRIPT_DATA.address}
                            </p>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '4px' }}>OFFICIAL TRANSCRIPT OF RECORDS</h3>
                </div>

                {/* Student Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    <div>
                        <table style={{ width: '100%', fontSize: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Student Name</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.profile?.firstName} {user?.profile?.lastName}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Student ID</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.profile?.studentId || 'STU-2024-001'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Date of Birth</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>12 Jan 2002</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table style={{ width: '100%', fontSize: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Department</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{user?.profile?.department || 'Computer Science'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Program</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>Bachelor of Technology</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Issue Date</td>
                                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{MOCK_TRANSCRIPT_DATA.issueDate}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Semester Records */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
                    {MOCK_TRANSCRIPT_DATA.semesters.map((sem) => (
                        <div key={sem.sem} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>SEMESTER {sem.sem} ({sem.year})</span>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>SGPA: {sem.sgpa}</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ textAlign: 'left', padding: '8px', width: '15%' }}>Code</th>
                                        <th style={{ textAlign: 'left', padding: '8px', width: '50%' }}>Subject Title</th>
                                        <th style={{ textAlign: 'center', padding: '8px', width: '15%' }}>Credits</th>
                                        <th style={{ textAlign: 'center', padding: '8px', width: '20%' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sem.subjects.map((sub, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--color-surface)' }}>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>{sub.code}</td>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{sub.name}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{sub.credits}</td>
                                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{sub.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Footer / Results Summary */}
                <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '2px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Grading System</h4>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>
                                CGPA is calculated on a scale of 10. Grade Points: O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Cumulative Grade Point Average (CGPA)</p>
                            <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Outfit' }}>9.30</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '120px', height: '1px', backgroundColor: 'var(--color-text-primary)', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '12px', fontWeight: 600 }}>Controller of Examinations</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <ShieldCheck size={32} color="var(--color-primary)" style={{ opacity: 0.5 }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '120px', height: '1px', backgroundColor: 'var(--color-text-primary)', marginBottom: '8px' }}></div>
                            <p style={{ fontSize: '12px', fontWeight: 600 }}>Registrar</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    .card { box-shadow: none; border: none; }
                }
            `}</style>
        </div>
    );
};

export default Transcript;
