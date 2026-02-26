import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AttendanceGrid from '../components/AttendanceGrid';
import {
    CalendarCheck, Clock, BookOpen, Loader2, ChevronRight, CheckCircle2
} from 'lucide-react';

export default function FacultyDashboard() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/faculty/${user.userId}/classes`)
            .then((r) => r.json())
            .then((data) => {
                setClasses(data.classes || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#E65100' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: '#0F172A' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

            <main className="flex-1 p-8" style={{ marginLeft: sidebarCollapsed ? '72px' : '256px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome, <span style={{ color: '#1E88E5' }}>{user?.name}</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                        Faculty ID: {user?.userId} &middot; Today&apos;s Classes
                    </p>
                </div>

                {/* If no class selected, show class list */}
                {!selectedClassId ? (
                    <div>
                        {classes.length === 0 ? (
                            <div className="glass-card p-12 text-center animate-fade-in-up">
                                <CalendarCheck className="w-12 h-12 mx-auto mb-4" style={{ color: '#64748B' }} />
                                <h3 className="text-lg font-semibold text-white mb-2">No Classes Today</h3>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    You don&apos;t have any scheduled classes today. Enjoy your day!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls, i) => (
                                    <button
                                        key={cls.classId}
                                        onClick={() => setSelectedClassId(cls.classId)}
                                        className="glass-card p-6 text-left transition-all duration-300 hover:scale-[1.02] animate-fade-in-up cursor-pointer group"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{
                                                    background: cls.attendanceMarked
                                                        ? 'linear-gradient(135deg, #10B981, #059669)'
                                                        : 'linear-gradient(135deg, #E65100, #FF6D00)'
                                                }}>
                                                {cls.attendanceMarked
                                                    ? <CheckCircle2 className="w-6 h-6 text-white" />
                                                    : <BookOpen className="w-6 h-6 text-white" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {cls.attendanceMarked && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                        Marked
                                                    </span>
                                                )}
                                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: '#64748B' }} />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">{cls.course_code}</h3>
                                        <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>{cls.course_name}</p>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" style={{ color: '#64748B' }} />
                                                <span className="text-xs" style={{ color: '#94A3B8' }}>
                                                    {cls.start_time} – {cls.end_time}
                                                </span>
                                            </div>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(165,180,252,0.15)', color: '#A78BFA' }}>
                                                {cls.room}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => setSelectedClassId(null)}
                            className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors duration-200 cursor-pointer"
                            style={{ color: '#94A3B8' }}
                            onMouseEnter={(e) => e.target.style.color = '#E65100'}
                            onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                        >
                            ← Back to Classes
                        </button>

                        <AttendanceGrid
                            classId={selectedClassId}
                            onAttendanceMarked={(classId) => {
                                setClasses(prev => prev.map(c =>
                                    c.classId === classId ? { ...c, attendanceMarked: true } : c
                                ));
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
