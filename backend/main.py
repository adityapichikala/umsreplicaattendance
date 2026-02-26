"""
LPU UMS — FastAPI Backend Server
Run: uvicorn main:app --reload --port 5000
"""
import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Database ─────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), 'lpu_ums.db')

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ── App ──────────────────────────────────────────────────
app = FastAPI(title="LPU UMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────
class LoginRequest(BaseModel):
    userId: str

class AttendanceRequest(BaseModel):
    classId: int
    date: str
    absentees: List[int] = []

class RectifyRequest(BaseModel):
    classId: int
    date: str
    absentees: List[int] = []

# ── Auth Routes ──────────────────────────────────────────
@app.post("/api/auth/login")
def login(req: LoginRequest):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM Users WHERE user_id = ?", (int(req.userId),)
        ).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "user": {
            "userId": user["user_id"],
            "name": user["name"],
            "role": user["role"],
            "avatarUrl": user["avatar_url"],
        },
    }

# ── Student Routes ───────────────────────────────────────
@app.get("/api/student/{student_id}/dashboard")
def student_dashboard(student_id: int):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM Users WHERE user_id = ? AND role = 'STUDENT'",
            (student_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Student not found")

        # Enrollments
        enrollments = conn.execute("""
            SELECT e.course_code, c.course_name, e.attendance_percent, e.cgpa
            FROM Enrollments e
            JOIN Courses c ON e.course_code = c.course_code
            WHERE e.student_id = ?
        """, (student_id,)).fetchall()

        total_att = (
            sum(e["attendance_percent"] for e in enrollments) / len(enrollments)
            if enrollments else 0
        )
        cgpa = enrollments[0]["cgpa"] if enrollments else 0

        # Fee
        fee = conn.execute(
            "SELECT * FROM Fees WHERE student_id = ?", (student_id,)
        ).fetchone()

        # Today's remaining timetable
        days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        today = days[datetime.now().weekday()]
        now = datetime.now().strftime("%H:%M")

        timetable = conn.execute("""
            SELECT t.course_code, c.course_name, t.start_time, t.end_time, t.room
            FROM Timetable t
            JOIN Courses c ON t.course_code = c.course_code
            WHERE t.day_of_week = ? AND t.end_time > ?
            ORDER BY t.start_time ASC
        """, (today, now)).fetchall()

    return {
        "user": {"userId": user["user_id"], "name": user["name"], "role": user["role"]},
        "attendance": {
            "overall": round(total_att, 1),
            "courses": [
                {
                    "courseCode": e["course_code"],
                    "courseName": e["course_name"],
                    "percent": e["attendance_percent"],
                }
                for e in enrollments
            ],
        },
        "cgpa": cgpa,
        "fee": {
            "amount": fee["amount"] if fee else 0,
            "status": fee["status"] if fee else "NIL",
            "dueDate": fee["due_date"] if fee else None,
        },
        "timetable": [dict(t) for t in timetable],
    }

# ── Faculty Routes ───────────────────────────────────────
@app.get("/api/faculty/{faculty_id}/classes")
def faculty_classes(faculty_id: int):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM Users WHERE user_id = ? AND role = 'FACULTY'",
            (faculty_id,),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Faculty not found")

        days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        today = days[datetime.now().weekday()]
        today_date = datetime.now().strftime("%Y-%m-%d")

        classes = conn.execute("""
            SELECT t.id as classId, t.course_code, c.course_name,
                   t.start_time, t.end_time, t.room, t.day_of_week
            FROM Timetable t
            JOIN Courses c ON t.course_code = c.course_code
            WHERE t.faculty_id = ? AND t.day_of_week = ?
            ORDER BY t.start_time ASC
        """, (faculty_id, today)).fetchall()

        # Check which classes already have attendance marked today
        result = []
        for c in classes:
            cd = dict(c)
            count = conn.execute(
                "SELECT COUNT(*) FROM Attendance WHERE class_id = ? AND date = ?",
                (cd["classId"], today_date)
            ).fetchone()[0]
            cd["attendanceMarked"] = count > 0
            result.append(cd)

    return {
        "faculty": {"userId": user["user_id"], "name": user["name"]},
        "classes": result,
    }


@app.get("/api/faculty/class/{class_id}/students")
def class_students(class_id: int, date: str = None):
    with get_db() as conn:
        class_info = conn.execute(
            "SELECT * FROM Timetable WHERE id = ?", (class_id,)
        ).fetchone()

        if not class_info:
            raise HTTPException(status_code=404, detail="Class not found")

        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        students = conn.execute("""
            SELECT u.user_id, u.name, u.avatar_url, e.attendance_percent
            FROM Enrollments e
            JOIN Users u ON e.student_id = u.user_id
            WHERE e.course_code = ? AND u.role = 'STUDENT'
            ORDER BY u.name ASC
        """, (class_info["course_code"],)).fetchall()

        # Check if attendance already exists for this class+date
        existing = conn.execute(
            "SELECT student_id, status FROM Attendance WHERE class_id = ? AND date = ?",
            (class_id, date)
        ).fetchall()
        existing_map = {row["student_id"]: row["status"] for row in existing}
        already_marked = len(existing_map) > 0

    return {
        "classInfo": {
            "classId": class_info["id"],
            "courseCode": class_info["course_code"],
            "startTime": class_info["start_time"],
            "endTime": class_info["end_time"],
            "room": class_info["room"],
        },
        "alreadyMarked": already_marked,
        "students": [
            {
                "userId": s["user_id"],
                "name": s["name"],
                "avatarUrl": s["avatar_url"],
                "attendancePercent": s["attendance_percent"],
                "status": existing_map.get(s["user_id"], "P"),
            }
            for s in students
        ],
    }


@app.post("/api/faculty/attendance")
def submit_attendance(req: AttendanceRequest):
    with get_db() as conn:
        class_info = conn.execute(
            "SELECT * FROM Timetable WHERE id = ?", (req.classId,)
        ).fetchone()

        if not class_info:
            raise HTTPException(status_code=404, detail="Class not found")

        enrolled = conn.execute("""
            SELECT e.student_id FROM Enrollments e
            JOIN Users u ON e.student_id = u.user_id
            WHERE e.course_code = ? AND u.role = 'STUDENT'
        """, (class_info["course_code"],)).fetchall()

        absent_set = set(req.absentees)

        for row in enrolled:
            sid = row["student_id"]
            status = "A" if sid in absent_set else "P"
            conn.execute(
                "INSERT INTO Attendance (student_id, class_id, status, date) VALUES (?,?,?,?)",
                (sid, req.classId, status, req.date),
            )

        conn.commit()

    return {
        "success": True,
        "message": f"Attendance recorded for {len(enrolled)} students ({len(req.absentees)} absent).",
        "totalStudents": len(enrolled),
        "absentCount": len(req.absentees),
        "presentCount": len(enrolled) - len(req.absentees),
    }


# ── Rectify Attendance ────────────────────────────────────
@app.put("/api/faculty/attendance/rectify")
def rectify_attendance(req: RectifyRequest):
    with get_db() as conn:
        class_info = conn.execute(
            "SELECT * FROM Timetable WHERE id = ?", (req.classId,)
        ).fetchone()

        if not class_info:
            raise HTTPException(status_code=404, detail="Class not found")

        # Delete existing attendance for this class+date
        conn.execute(
            "DELETE FROM Attendance WHERE class_id = ? AND date = ?",
            (req.classId, req.date)
        )

        # Re-insert with updated data
        enrolled = conn.execute("""
            SELECT e.student_id FROM Enrollments e
            JOIN Users u ON e.student_id = u.user_id
            WHERE e.course_code = ? AND u.role = 'STUDENT'
        """, (class_info["course_code"],)).fetchall()

        absent_set = set(req.absentees)

        for row in enrolled:
            sid = row["student_id"]
            status = "A" if sid in absent_set else "P"
            conn.execute(
                "INSERT INTO Attendance (student_id, class_id, status, date) VALUES (?,?,?,?)",
                (sid, req.classId, status, req.date),
            )

        conn.commit()

    return {
        "success": True,
        "message": f"Attendance rectified for {len(enrolled)} students ({len(req.absentees)} absent).",
        "totalStudents": len(enrolled),
        "absentCount": len(req.absentees),
        "presentCount": len(enrolled) - len(req.absentees),
    }


# ── Health ───────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}
