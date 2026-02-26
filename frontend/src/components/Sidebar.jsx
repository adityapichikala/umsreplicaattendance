import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    GraduationCap, LayoutDashboard, CalendarCheck, BookOpen,
    CreditCard, Clock, LogOut, Users, ClipboardCheck, User,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/student/courses', icon: BookOpen, label: 'Courses' },
    { to: '/student/fees', icon: CreditCard, label: 'Fees' },
    { to: '/student/timetable', icon: Clock, label: 'Timetable' },
];

const facultyLinks = [
    { to: '/faculty', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/faculty/attendance', icon: ClipboardCheck, label: 'Mark Attendance' },
    { to: '/faculty/students', icon: Users, label: 'Students' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isStudent = user?.role === 'STUDENT';
    const links = isStudent ? studentLinks : facultyLinks;

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <>
            {/* Sidebar */}
            <aside
                className="fixed left-0 top-0 h-screen flex flex-col z-50"
                style={{
                    width: collapsed ? '72px' : '256px',
                    background: 'linear-gradient(180deg, #E65100 0%, #BF360C 100%)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                }}
            >
                {/* Brand + Toggle */}
                <div className="p-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold text-white tracking-tight whitespace-nowrap">LPU UMS</h1>
                                <p className="text-xs text-white/60 whitespace-nowrap">Management System</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 cursor-pointer flex-shrink-0"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed
                            ? <PanelLeftOpen className="w-4 h-4 text-white" />
                            : <PanelLeftClose className="w-4 h-4 text-white" />
                        }
                    </button>
                </div>

                {/* User Info */}
                <div className="mx-3 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-white/60">{user?.userId}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
                    {links.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            title={collapsed ? label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${isActive
                                    ? 'bg-white/25 text-white shadow-lg'
                                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-2 mt-auto">
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Sign Out' : undefined}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>
        </>
    );
}
