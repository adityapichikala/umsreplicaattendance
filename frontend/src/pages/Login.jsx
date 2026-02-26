import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, BookOpen, Sparkles } from 'lucide-react';

export default function Login() {
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // ── Polymorphic Role Detection (Regex) ──────────────
    const detected = useMemo(() => {
        if (/^\d{8}$/.test(userId)) return 'STUDENT';
        if (/^\d{5}$/.test(userId)) return 'FACULTY';
        return null;
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!detected) {
            setError('Enter a valid 8-digit Student ID or 5-digit Faculty ID');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = await login(userId);
            navigate(user.role === 'STUDENT' ? '/student' : '/faculty', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)' }}>

            {/* Decorative BG Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #E65100, transparent)' }} />
                <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-8"
                    style={{ background: 'radial-gradient(circle, #1565C0, transparent)' }} />
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #E65100, #FF6D00)', boxShadow: '0 8px 32px rgba(230,81,0,0.4)' }}>
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">LPU UMS</h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>University Management System</p>
                </div>

                {/* Login Card */}
                <form onSubmit={handleSubmit} className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <LogIn className="w-5 h-5" style={{ color: '#E65100' }} />
                        Sign In
                    </h2>

                    {/* Single Input Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                            User ID
                        </label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => { setUserId(e.target.value); setError(''); }}
                            placeholder="Enter Student or Faculty ID"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-300 focus:ring-2"
                            style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(148, 163, 184, 0.15)',
                                focusRingColor: '#E65100',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#E65100'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)'}
                            autoFocus
                        />
                    </div>

                    {/* Role Detection Badge */}
                    {detected && (
                        <div className="mb-4 animate-fade-in">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white`}
                                style={{
                                    background: detected === 'STUDENT'
                                        ? 'linear-gradient(135deg, #E65100, #FF6D00)'
                                        : 'linear-gradient(135deg, #1565C0, #1E88E5)',
                                    animation: 'pulse-glow 2s infinite',
                                }}>
                                <Sparkles className="w-4 h-4" />
                                {detected === 'STUDENT' ? (
                                    <><GraduationCap className="w-4 h-4" /> Welcome Student</>
                                ) : (
                                    <><BookOpen className="w-4 h-4" /> Welcome Faculty</>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !detected}
                        className="w-full py-3 rounded-xl text-white font-semibold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            background: detected
                                ? (detected === 'STUDENT'
                                    ? 'linear-gradient(135deg, #E65100, #FF6D00)'
                                    : 'linear-gradient(135deg, #1565C0, #1E88E5)')
                                : 'rgba(148, 163, 184, 0.2)',
                            boxShadow: detected ? '0 8px 24px rgba(230,81,0,0.3)' : 'none',
                        }}
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    {/* Hint */}
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <p className="text-xs text-center" style={{ color: '#64748B' }}>
                            Demo: Student <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(230,81,0,0.15)', color: '#FF6D00' }}>11812345</span>
                            &nbsp;|&nbsp; Faculty <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(21,101,192,0.15)', color: '#1E88E5' }}>14234</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
