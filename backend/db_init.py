"""
LPU UMS — Database Initialization & Seed Script
Run: python db_init.py
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'lpu_ums.db')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ── Create Tables ──────────────────────────────────────
    c.executescript("""
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('STUDENT', 'FACULTY')),
            avatar_url TEXT
        );

        CREATE TABLE IF NOT EXISTS Courses (
            course_code TEXT PRIMARY KEY,
            course_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_code TEXT NOT NULL,
            attendance_percent REAL DEFAULT 0,
            cgpa REAL DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES Users(user_id),
            FOREIGN KEY (course_code) REFERENCES Courses(course_code)
        );

        CREATE TABLE IF NOT EXISTS Attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            class_id INTEGER,
            status TEXT DEFAULT 'P' CHECK(status IN ('P', 'A')),
            date TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES Users(user_id)
        );

        CREATE TABLE IF NOT EXISTS Timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_code TEXT NOT NULL,
            faculty_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            room TEXT DEFAULT 'LH-301',
            FOREIGN KEY (course_code) REFERENCES Courses(course_code),
            FOREIGN KEY (faculty_id) REFERENCES Users(user_id)
        );

        CREATE TABLE IF NOT EXISTS Fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            amount REAL DEFAULT 0,
            status TEXT DEFAULT 'NIL' CHECK(status IN ('NIL', 'PENDING', 'PAID')),
            due_date TEXT,
            FOREIGN KEY (student_id) REFERENCES Users(user_id)
        );
    """)

    # ── Clear & Seed ───────────────────────────────────────
    for table in ['Fees', 'Timetable', 'Attendance', 'Enrollments', 'Courses', 'Users']:
        c.execute(f'DELETE FROM {table}')

    # Users
    users = [
        (11812345, 'Aditya Kumar',    'STUDENT', None),
        (11812346, 'Priya Sharma',    'STUDENT', None),
        (11812347, 'Rahul Verma',     'STUDENT', None),
        (11812348, 'Sneha Gupta',     'STUDENT', None),
        (11812349, 'Amit Patel',      'STUDENT', None),
        (14234,    'Dr. Rajesh Sharma','FACULTY', None),
    ]
    c.executemany('INSERT INTO Users VALUES (?,?,?,?)', users)

    # Courses
    courses = [
        ('CSE310', 'Data Structures & Algorithms'),
        ('CSE205', 'Object Oriented Programming'),
        ('MTH174', 'Discrete Mathematics'),
    ]
    c.executemany('INSERT INTO Courses VALUES (?,?)', courses)

    # Enrollments
    students = [11812345, 11812346, 11812347, 11812348, 11812349]
    course_codes = ['CSE310', 'CSE205', 'MTH174']
    attendance_data = [
        [82.5, 78.0, 91.2],
        [90.0, 85.5, 72.3],
        [65.0, 88.0, 79.5],
        [95.0, 92.0, 88.8],
        [70.0, 60.5, 75.1],
    ]
    cgpa_data = [8.2, 7.8, 6.5, 9.1, 7.0]

    for i, sid in enumerate(students):
        for j, cc in enumerate(course_codes):
            c.execute(
                'INSERT INTO Enrollments (student_id, course_code, attendance_percent, cgpa) VALUES (?,?,?,?)',
                (sid, cc, attendance_data[i][j], cgpa_data[i])
            )

    # Timetable (generate for today)
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    today = days[datetime.now().weekday()]
    tomorrow_idx = (datetime.now().weekday() + 1) % 7
    tomorrow = days[tomorrow_idx]

    timetable_entries = [
        ('CSE310', 14234, today,    '09:00', '10:00', 'LH-301'),
        ('CSE205', 14234, today,    '10:15', '11:15', 'LH-302'),
        ('MTH174', 14234, today,    '14:00', '15:00', 'LH-205'),
        ('CSE310', 14234, tomorrow, '11:00', '12:00', 'LH-301'),
    ]
    c.executemany(
        'INSERT INTO Timetable (course_code, faculty_id, day_of_week, start_time, end_time, room) VALUES (?,?,?,?,?,?)',
        timetable_entries
    )

    # Fees
    fees = [
        (11812345, 0,     'NIL',     None),
        (11812346, 45000, 'PENDING', '2026-03-15'),
        (11812347, 0,     'NIL',     None),
        (11812348, 12000, 'PENDING', '2026-04-01'),
        (11812349, 0,     'PAID',    None),
    ]
    c.executemany(
        'INSERT INTO Fees (student_id, amount, status, due_date) VALUES (?,?,?,?)',
        fees
    )

    conn.commit()
    conn.close()
    print(f'[OK] Database initialized and seeded at: {DB_PATH}')

if __name__ == '__main__':
    init_database()
