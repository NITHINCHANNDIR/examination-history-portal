import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Upload,
    Bot,
    Activity,
    FileUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    RefreshCw,
    ArrowUpRight,
    ShieldCheck,
    Search
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { SkeletonStats, SkeletonTable } from '../ui/Skeleton';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [agentLogs, setAgentLogs] = useState([]);
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsRes, logsRes, insightsRes] = await Promise.all([
                adminApi.getStudents({ limit: 1 }),
                adminApi.getAgentLogs({ limit: 10 }),
                adminApi.getInsights({ limit: 5 })
            ]);

            setStats({
                totalStudents: studentsRes.data.total,
                totalLogs: logsRes.data.total,
                pendingInsights: insightsRes.data.data.filter(i => !i.acknowledgedBy).length
            });
            setAgentLogs(logsRes.data.data || []);
            setInsights(insightsRes.data.data || []);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer?.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    }, []);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        setUploadProgress({ status: 'uploading', filename: file.name });

        try {
            const response = await adminApi.uploadResults(formData);
            setUploadProgress({
                status: 'success',
                filename: file.name,
                result: response.data.data
            });
            loadData();
        } catch (error) {
            setUploadProgress({
                status: 'error',
                filename: file.name,
                error: error.response?.data?.message || 'Upload failed'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--color-success)';
            case 'failed': return 'var(--color-error)';
            case 'running': return 'var(--color-primary)';
            case 'grounded': return 'var(--color-warning)';
            default: return 'var(--color-text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'failed': return AlertTriangle;
            case 'running': return RefreshCw;
            default: return Clock;
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '32px' }}>
                <div className="skeleton" style={{ width: '250px', height: '32px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '400px', height: '20px', marginBottom: '32px' }} />
                <SkeletonStats count={4} />
                <div style={{ marginTop: '32px' }}>
                    <SkeletonTable rows={5} cols={5} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Admin Command Center
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Oversee student records, coordinate Antigravity Agent tasks, and manage data integrity.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary"><Activity size={18} /> System Status</button>
                    <button className="btn btn-primary"><ShieldCheck size={18} /> Security Audit</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '32px'
                }}
            >
                {[
                    { label: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'var(--color-primary)', bg: 'rgba(99, 102, 241, 0.1)' },
                    { label: 'Agent Tasks', value: stats?.totalLogs || 0, icon: Bot, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
                    { label: 'Pending AI', value: stats?.pendingInsights || 0, icon: Activity, color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Integrity Score', value: '98.4%', icon: ShieldCheck, color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)' }
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: stat.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <stat.icon size={28} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit, sans-serif' }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Upload Section */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={22} color="var(--color-primary)" />
                            Result Ingestion
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Directly sync examination results from CSV/JSON sources.</p>
                    </div>

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            borderRadius: '20px',
                            padding: '48px 32px',
                            textAlign: 'center',
                            backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.03)' : 'var(--color-surface)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input id="file-upload" type="file" accept=".csv,.json" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: 'var(--color-card-bg, white)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                            marginBottom: '20px'
                        }}>
                            <FileUp size={32} color="var(--color-primary)" />
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                            Select Data File
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            Drag & drop CSV or JSON files here
                        </p>
                    </div>

                    {uploadProgress && (
                        <div style={{
                            marginTop: '20px',
                            padding: '20px',
                            borderRadius: '16px',
                            backgroundColor: uploadProgress.status === 'success' ? 'rgba(16, 185, 129, 0.05)' : uploadProgress.status === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
                            border: `1px solid ${uploadProgress.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : uploadProgress.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'var(--color-border)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {uploadProgress.status === 'uploading' && <RefreshCw className="animate-spin" size={24} color="var(--color-primary)" />}
                                {uploadProgress.status === 'success' && <CheckCircle size={24} color="var(--color-success)" />}
                                {uploadProgress.status === 'error' && <AlertTriangle size={24} color="var(--color-error)" />}
                                <div>
                                    <p style={{ fontSize: '15px', fontWeight: 700 }}>{uploadProgress.filename}</p>
                                    {uploadProgress.status === 'success' && uploadProgress.result && (
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                            Successfully processed {uploadProgress.result.uploaded} records
                                            {uploadProgress.result.errors > 0 && ` (${uploadProgress.result.errors} failed)`}
                                        </p>
                                    )}
                                    {uploadProgress.status === 'error' && <p style={{ fontSize: '13px', color: 'var(--color-error)', fontWeight: 500 }}>{uploadProgress.error}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Batch Insights */}
                <div className="card">
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={22} color="var(--color-warning)" />
                                AI Batch Insights
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Agent-generated alerts and pattern analysis.</p>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>View History</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {insights.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ opacity: 0.1, marginBottom: '16px' }}><Activity size={48} style={{ margin: '0 auto' }} /></div>
                                <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Awaiting pattern detection</p>
                            </div>
                        ) : (
                            insights.map((insight) => (
                                <div key={insight._id} style={{ padding: '16px', borderRadius: '16px', border: '1.5px solid var(--color-border)', background: 'var(--color-card-bg, white)', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span className={`badge ${insight.severity === 'critical' ? 'badge-error' : insight.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>{insight.severity}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{new Date(insight.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{insight.data?.summary}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                        {insight.insightType.replace(/_/g, ' ')} • Academic {insight.scope?.academicYear}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Agent Logs Table */}
            <div className="card" style={{ marginTop: '24px', padding: '0' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={22} color="var(--color-success)" />
                            Antigravity Agent Execution Logs
                        </h3>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input className="input" placeholder="Search tasks..." style={{ width: '240px', paddingLeft: '36px', height: '36px' }} />
                    </div>
                </div>

                <div style={{ padding: '0 16px' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ padding: '16px 24px' }}>Task Type</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Origin</th>
                                <th>Performance</th>
                                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Execution Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No operations logged yet</p>
                                    </td>
                                </tr>
                            ) : (
                                agentLogs.map((log) => {
                                    const StatusIcon = getStatusIcon(log.status);
                                    return (
                                        <tr key={log._id}>
                                            <td style={{ padding: '20px 24px', fontWeight: 700 }}>
                                                {log.taskType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </td>
                                            <td>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(log.status), fontWeight: 700, fontSize: '13px' }}>
                                                    <StatusIcon size={16} />
                                                    {log.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${log.priority === 'high' ? 'badge-error' : log.priority === 'medium' ? 'badge-warning' : 'badge-info'}`} style={{ minWidth: '80px', justifyContent: 'center' }}>{log.priority}</span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{log.triggeredBy}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{log.metrics?.duration ? `${(log.metrics.duration / 1000).toFixed(2)}s` : '-'}</span>
                                                    <div style={{ height: '4px', width: '40px', backgroundColor: 'var(--color-surface)', borderRadius: '10px' }}>
                                                        <div style={{ height: '100%', width: '70%', backgroundColor: 'var(--color-primary)', borderRadius: '10px' }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, textAlign: 'right', paddingRight: '24px' }}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
