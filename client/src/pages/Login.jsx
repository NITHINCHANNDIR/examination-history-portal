import { useState } from 'react';
import { GraduationCap, Mail, Lock, User, Building2, ArrowRight, BookOpen } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        studentId: '',
        department: '',
        batchYear: new Date().getFullYear()
    });

    const { login, register, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await register(formData);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-background)',
            backgroundImage: `
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0, transparent 50%),
                radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.1) 0, transparent 50%)
            `,
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Abstract Shapes */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                borderRadius: '50%',
                filter: 'blur(100px)',
                opacity: 0.1
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '40%',
                height: '40%',
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-warning))',
                borderRadius: '50%',
                filter: 'blur(100px)',
                opacity: 0.1
            }} />

            <div className="glass" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '48px',
                borderRadius: 'var(--border-radius-xl)',
                boxShadow: 'var(--shadow-premium)',
                backgroundColor: 'var(--color-card-bg, rgba(255, 255, 255, 0.8))',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <GraduationCap size={40} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {isLogin ? 'Enter your credentials to access the portal' : 'Start your academic journey with us'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        color: 'var(--color-error)',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                        First Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="input"
                                            style={{ paddingLeft: '48px', height: '48px' }}
                                            required
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ height: '48px' }}
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                    Student ID
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <BookOpen size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ paddingLeft: '48px', height: '48px' }}
                                        placeholder="e.g., STU2024001"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                        Department
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="input"
                                            style={{ paddingLeft: '48px', height: '48px' }}
                                            placeholder="Computer Science"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        name="batchYear"
                                        value={formData.batchYear}
                                        onChange={handleChange}
                                        className="input"
                                        style={{ height: '48px' }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                style={{ paddingLeft: '48px', height: '48px' }}
                                placeholder="student@university.edu"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                Password
                            </label>
                            {isLogin && (
                                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                style={{ paddingLeft: '48px', height: '48px' }}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            height: '52px',
                            fontSize: '16px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}
                    >
                        {isLoading ? (
                            <>Please wait...</>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    </span>{' '}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            clearError();
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginLeft: '4px'
                        }}
                    >
                        {isLogin ? 'Register Now' : 'Sign In'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
