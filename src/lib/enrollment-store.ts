import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";

import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  // จัดการวิชา
  addCourse: (course: Course) => void;
  deleteCourse: (courseCode: string) => void;

  // จัดการผู้สอน
  addInstructor: (courseCode: string, instructor: string) => void;
  removeInstructor: (courseCode: string, instructor: string) => void;

  // จัดการการลงทะเบียน
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  removeStudentFromCourse: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      // เพิ่มวิชา
      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, course],
        })),

      // ลบวิชา
      deleteCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter(
            (course) => course.courseCode !== courseCode,
          ),

          // เมื่อลบวิชา ต้องเอาวิชานั้นออกจาก
          // enrolledCourses ของนักศึกษาด้วย
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: student.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      // เพิ่มผู้สอน
      addInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: [...(course.instructors ?? []), instructor],
                }
              : course,
          ),
        })),

      // ลบผู้สอน
      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: (course.instructors ?? []).filter(
                    (name) => name !== instructor,
                  ),
                }
              : course,
          ),
        })),

      // ลงทะเบียนนักศึกษาหลายคนในวิชาเดียว
      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (
              studentIds.includes(student.studentId) &&
              !student.enrolledCourses.includes(courseCode)
            ) {
              return {
                ...student,
                enrolledCourses: [...student.enrolledCourses, courseCode],
              };
            }

            return student;
          }),
        })),

      // ถอนนักศึกษาออกจากวิชา
      removeStudentFromCourse: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.studentId === studentId
              ? {
                  ...student,
                  enrolledCourses: student.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : student,
          ),
        })),
    }),

    {
      name: "lab16-2569-680610704",

      // เก็บเฉพาะ students และ courses ลง Local Storage
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
