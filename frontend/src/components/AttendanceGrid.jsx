import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Send, Loader2, Users, RotateCcw, Lock } from 'lucide-react';

export default function AttendanceGrid({ classId, onAttendanceMarked }) {
    const [students, setStudents] = useState([]);
    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [rectifyMode, setRectifyMode] = useState(false);

    useEffect(() => {
        if (!classId) return;
        setLoading(true);
        fetch(`/api/faculty/class/${classId}/students`)
            .then((r) => r.json())
            .then((data) => {
                setClassInfo(data.classInfo);
                setStudents(data.students);
                setAlreadyMarked(data.alreadyMarked);
                setSubmitted(data.alreadyMarked);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [classId]);

    // Toggle a single student: P <-> A
    const toggleStudent = useCallback((userId) => {
        // Only allow toggling if not yet submitted, or in rectify mode
        if (submitted && !rectifyMode) return;
        setStudents((prev) =>
            prev.map((s) =>
                s.userId === userId
                    ? { ...s, status: s.status === 'P' ? 'A' : 'P' }
                    : s
            )
        );
    }, [submitted, rectifyMode]);

    // Batch submit — only send absentees
    const handleSubmit = async () => {
        setSubmitting(true);
        const absentees = students.filter((s) => s.status === 'A').map((s) => s.userId);
        const today = new Date().toISOString().split('T')[0];

        const isRectify = rectifyMode && alreadyMarked;
        const url = isRectify ? '/api/faculty/attendance/rectify' : '/api/faculty/attendance';
        const method = isRectify ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, date: today, absentees }),
            });
            const data = await res.json();
            setSubmitted(true);
            setRectifyMode(false);
            setAlreadyMarked(true);
            setToast({
                type: 'success',
                message: isRectify ? 'Attendance rectified successfully!' : data.message
            });
            if (onAttendanceMarked) onAttendanceMarked(classId);
            setTimeout(() => setToast(null), 4000);
        } catch {
            setToast({ type: 'error', message: 'Failed to submit attendance' });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEnterRectify = () => {
        setRectifyMode(true);
        setSubmitted(false);
    };

    const handleCancelRectify = () => {
        // Reload original data
        setLoading(true);
        fetch(`/api/faculty/class/${classId}/students`)
            .then((r) => r.json())
            .then((data) => {
                setStudents(data.students);
                setAlreadyMarked(data.alreadyMarked);
                setSubmitted(data.alreadyMarked);
                setRectifyMode(false);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const presentCount = students.filter((s) => s.status === 'P').length;
    const absentCount = students.filter((s) => s.status === 'A').length;
    const canEdit = !submitted || rectifyMode;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E65100' }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            {classInfo && (
                <div className="glass-card p-5 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-white">{classInfo.courseCode}</h3>
                                {alreadyMarked && !rectifyMode && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Marked
                                    </span>
                                )}
                                {rectifyMode && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                                        <RotateCcw className="w-3.5 h-3.5" /> Rectify Mode
                                    </span>
                                )}
                            </div>
                            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                                {classInfo.startTime} – {classInfo.endTime} | Room {classInfo.room}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>
                                <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                                <span className="text-sm font-semibold" style={{ color: '#10B981' }}>{presentCount} Present</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)' }}>
                                <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                                <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>{absentCount} Absent</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Instruction */}
            <p className="text-sm mb-4 flex items-center gap-2" style={{ color: '#64748B' }}>
                <Users className="w-4 h-4" />
                {canEdit ? (
                    <>
                        {rectifyMode ? 'Rectify mode: ' : ''}
                        All students are marked <span className="font-semibold" style={{ color: '#10B981' }}>Present</span> by default.
                        Click a card to mark <span className="font-semibold" style={{ color: '#EF4444' }}>Absent</span>.
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" />
                        Attendance has been submitted. Click <strong>Rectify</strong> below to make changes.
                    </>
                )}
            </p>

            {/* Student Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                {students.map((student, i) => {
                    const isPresent = student.status === 'P';
                    return (
                        <button
                            key={student.userId}
                            onClick={() => toggleStudent(student.userId)}
                            disabled={!canEdit}
                            className="relative p-4 rounded-2xl text-center transition-all duration-300 cursor-pointer disabled:cursor-not-allowed border-2"
                            style={{
                                background: isPresent
                                    ? 'rgba(16, 185, 129, 0.08)'
                                    : 'rgba(239, 68, 68, 0.08)',
                                borderColor: isPresent
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(239, 68, 68, 0.3)',
                                animationDelay: `${i * 50}ms`,
                                boxShadow: isPresent
                                    ? '0 4px 16px rgba(16, 185, 129, 0.1)'
                                    : '0 4px 16px rgba(239, 68, 68, 0.1)',
                                opacity: canEdit ? 1 : 0.7,
                            }}
                        >
                            {/* Status Icon */}
                            <div className="absolute top-2 right-2">
                                {isPresent
                                    ? <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                                    : <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
                                }
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-white"
                                style={{
                                    background: isPresent
                                        ? 'linear-gradient(135deg, #10B981, #059669)'
                                        : 'linear-gradient(135deg, #EF4444, #DC2626)',
                                }}>
                                {student.name.charAt(0)}
                            </div>

                            <p className="text-sm font-semibold text-white truncate">{student.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{student.userId}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                    background: isPresent ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: isPresent ? '#10B981' : '#EF4444',
                                }}>
                                {isPresent ? 'PRESENT' : 'ABSENT'}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {canEdit ? (
                    <>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                            style={{
                                background: rectifyMode
                                    ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                    : 'linear-gradient(135deg, #E65100, #FF6D00)',
                                boxShadow: rectifyMode
                                    ? '0 8px 24px rgba(245, 158, 11, 0.3)'
                                    : '0 8px 24px rgba(230, 81, 0, 0.3)',
                            }}
                        >
                            {submitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                            ) : rectifyMode ? (
                                <><RotateCcw className="w-5 h-5" /> Save Rectification</>
                            ) : (
                                <><Send className="w-5 h-5" /> Submit Attendance</>
                            )}
                        </button>
                        {rectifyMode && (
                            <button
                                onClick={handleCancelRectify}
                                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer"
                                style={{ background: 'rgba(148,163,184,0.15)', color: '#94A3B8', border: '1px solid rgba(148,163,184,0.2)' }}
                            >
                                Cancel
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        onClick={handleEnterRectify}
                        className="px-8 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                        }}
                    >
                        <RotateCcw className="w-5 h-5" /> Rectify Attendance
                    </button>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
