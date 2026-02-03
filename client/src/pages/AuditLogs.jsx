import { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, Download, FileText, User } from 'lucide-react';
import { superAdminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const response = await superAdminApi.getAuditLogs();
            setLogs(response.data.data);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Security Audit Trail
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Immutable record of all system modifications and access events.
                    </p>
                </div>
                <button className="btn btn-secondary" style={{ gap: '8px' }}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Search by user or action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                            <Filter size={16} /> Filter Date
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={10} cols={5} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>Actor</th>
                                    <th>Action Event</th>
                                    <th>Resource Target</th>
                                    <th>IP Address</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                            <div style={{ opacity: 0.5, marginBottom: '16px' }}><Shield size={48} style={{ margin: '0 auto' }} /></div>
                                            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>No audit records found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td style={{ padding: '16px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--color-primary)'
                                                    }}>
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{log.user?.email || 'Unknown'}</p>
                                                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{log.user?.roles?.[0] || 'User'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FileText size={14} color="var(--color-text-secondary)" />
                                                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                                                        {log.details?.resourceId ? log.details.resourceId.substring(0, 12) + '...' : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                                    {log.ipAddress || '127.0.0.1'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
