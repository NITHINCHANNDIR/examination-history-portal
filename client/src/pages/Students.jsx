import { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Plus, Mail, BookOpen, ChevronRight } from 'lucide-react';
import { adminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await adminApi.getStudents();
            setStudents(response.data.data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Student Directory
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Manage {students.length} active student records.
                    </p>
                </div>
                <button className="btn btn-primary" style={{ gap: '8px' }}>
                    <Plus size={18} />
                    Add New Student
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Visual Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={8} cols={5} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>Student Name</th>
                                    <th>ID Number</th>
                                    <th>Department</th>
                                    <th>Contact</th>
                                    <th>Batch</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}>
                                            <div style={{ opacity: 0.5, marginBottom: '16px' }}><Users size={48} style={{ margin: '0 auto' }} /></div>
                                            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px' }}>No students found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${student._id}`)}>
                                            <td style={{ padding: '16px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        backgroundColor: 'var(--color-surface)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        color: 'var(--color-primary)',
                                                        fontSize: '15px'
                                                    }}>
                                                        {student.profile?.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            {student.profile?.firstName} {student.profile?.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>
                                                {student.studentId}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <BookOpen size={14} color="var(--color-text-secondary)" />
                                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{student.profile?.department}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Mail size={14} color="var(--color-text-secondary)" />
                                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{student.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{student.profile?.batchYear}</span>
                                            </td>
                                            <td style={{ paddingRight: '32px', textAlign: 'right' }}>
                                                <ChevronRight size={18} color="var(--color-text-muted)" />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Footer Pagination (Mock) */}
                <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        Showing {filteredStudents.length} of {students.length} entries
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" disabled>Previous</button>
                        <button className="btn btn-secondary" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Students;
