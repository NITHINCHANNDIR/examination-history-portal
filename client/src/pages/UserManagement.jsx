import { useState, useEffect } from 'react';
import { Shield, UserPlus, Search, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { superAdminApi } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await superAdminApi.getUsers();
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await superAdminApi.toggleUserStatus(id);
            setUsers(users.map(u => u._id === id ? { ...u, active: !u.active } : u));
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        User Administration
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                        Manage access controls and roles for {users.length} registered accounts.
                    </p>
                </div>
                <button className="btn btn-primary" style={{ gap: '8px' }}>
                    <UserPlus size={18} />
                    Add Administrator
                </button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="Find user by email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', boxShadow: 'none' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '32px' }}><SkeletonTable rows={8} cols={5} /></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '20px 32px' }}>User Details</th>
                                    <th>Role</th>
                                    <th>Last Login</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No users found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td style={{ padding: '20px 32px' }}>
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
                                                        color: 'var(--color-text-primary)'
                                                    }}>
                                                        {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                                                            {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'System User'}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.roles.includes('superadmin') ? 'badge-primary' : user.roles.includes('admin') ? 'badge-info' : 'badge-secondary'}`}>
                                                    {user.roles.join(', ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td>
                                                {user.active ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '13px' }}>
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>
                                                        <XCircle size={14} /> Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px', height: 'auto' }}
                                                        onClick={() => handleToggleStatus(user._id)}
                                                    >
                                                        {user.active ? 'Suspend' : 'Activate'}
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ padding: '8px', border: 'none', background: 'transparent' }}>
                                                        <MoreHorizontal size={18} color="var(--color-text-secondary)" />
                                                    </button>
                                                </div>
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

export default UserManagement;
