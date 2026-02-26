import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import CircularProgress from '../components/CircularProgress';
import {
    CalendarCheck, CreditCard, Clock, TrendingUp,
    BookOpen, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/student/${user.userId}/dashboard`)
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#E65100' }} />
            </div>
        );
    }

    if (!data) return null;

    const isAttendanceGood = data.attendance.overall >= 75;

    return (
        <div className="flex min-h-screen" style={{ background: '#0F172A' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

            <main className="flex-1 p-8" style={{ marginLeft: sidebarCollapsed ? '72px' : '256px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, <span style={{ color: '#FF6D00' }}>{data.user.name}</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                        Student ID: {data.user.userId} &middot; Here&apos;s your dashboard overview
                    </p>
                </div>

                {/* Widget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                    {/* ── Attendance Widget ──────────────────────── */}
                    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarCheck className="w-5 h-5" style={{ color: '#E65100' }} />
                            <h3 className="text-sm font-semibold text-white">Overall Attendance</h3>
                        </div>
                        <div className="flex justify-center">
                            <CircularProgress value={data.attendance.overall} size={130} strokeWidth={12} />
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {isAttendanceGood ? (
                                <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                                    <AlertTriangle className="w-3.5 h-3.5" /> Below 75%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── CGPA Widget ───────────────────────────── */}
                    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5" style={{ color: '#1E88E5' }} />
                            <h3 className="text-sm font-semibold text-white">Current CGPA</h3>
                        </div>
                        <div className="flex items-center justify-center py-4">
                            <div className="text-center">
                                <span className="text-5xl font-extrabold" style={{
                                    background: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>{data.cgpa}</span>
                                <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>out of 10.0</p>
                            </div>
                        </div>
                        <div className="w-full h-2 rounded-full mt-2" style={{ background: 'rgba(148,163,184,0.1)' }}>
                            <div className="h-2 rounded-full transition-all duration-1000"
                                style={{
                                    width: `${(data.cgpa / 10) * 100}%`,
                                    background: 'linear-gradient(90deg, #1E88E5, #42A5F5)',
                                }} />
                        </div>
                    </div>

                    {/* ── Fee Widget ────────────────────────────── */}
                    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5" style={{ color: '#F59E0B' }} />
                            <h3 className="text-sm font-semibold text-white">Fee Status</h3>
                        </div>
                        <div className="flex items-center justify-center py-4">
                            {data.fee.status === 'NIL' || data.fee.status === 'PAID' ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                                        style={{ background: 'rgba(16,185,129,0.15)' }}>
                                        <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
                                    </div>
                                    <span className="text-2xl font-bold" style={{ color: '#10B981' }}>NIL</span>
                                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>No Dues</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                                        style={{ background: 'rgba(239,68,68,0.15)' }}>
                                        <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
                                    </div>
                                    <span className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                                        ₹{data.fee.amount.toLocaleString()}
                                    </span>
                                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Due: {data.fee.dueDate}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Timetable Widget ──────────────────────── */}
                    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                            <h3 className="text-sm font-semibold text-white">Today&apos;s Classes</h3>
                        </div>
                        {data.timetable.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm" style={{ color: '#94A3B8' }}>No more classes today</p>
                                <p className="text-xs mt-1" style={{ color: '#64748B' }}>Enjoy your free time!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {data.timetable.map((cls, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                                        style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148,163,184,0.08)' }}
                                    >
                                        <div className="w-1 h-10 rounded-full" style={{ background: '#A78BFA' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{cls.course_name}</p>
                                            <p className="text-xs" style={{ color: '#94A3B8' }}>
                                                {cls.start_time} – {cls.end_time} &middot; {cls.room}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Course-wise Attendance Breakdown ──────── */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <BookOpen className="w-5 h-5" style={{ color: '#E65100' }} />
                        <h3 className="text-sm font-semibold text-white">Course-wise Attendance</h3>
                    </div>
                    <div className="space-y-4">
                        {data.attendance.courses.map((course) => {
                            const good = course.percent >= 75;
                            return (
                                <div key={course.courseCode}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{course.courseCode}</span>
                                            <span className="text-xs" style={{ color: '#94A3B8' }}>{course.courseName}</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: good ? '#10B981' : '#EF4444' }}>
                                            {course.percent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148,163,184,0.1)' }}>
                                        <div
                                            className="h-2 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${course.percent}%`,
                                                background: good
                                                    ? 'linear-gradient(90deg, #10B981, #059669)'
                                                    : 'linear-gradient(90deg, #EF4444, #DC2626)',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
