import { COURSES } from './courses'
import { COURSES_CS } from './courses-cs'
import type { CourseInfo } from './types'

/**
 * แคตตาล็อกวิชาเฉพาะรวมทุกหลักสูตร (สถิติ 2564 + วิทยาการคอมพิวเตอร์ 2569)
 * สำหรับ lookup ชื่อ/หน่วยกิตโดยไม่ผูกกับสาขา — รหัสส่วนใหญ่ไม่ชนกัน
 * (346-xxx สถิติ / 344-xxx คอมพ์); รหัสที่ใช้ร่วม เช่น 322-101 ชื่อตรงกัน
 */
export const ALL_COURSES: Record<string, CourseInfo> = { ...COURSES, ...COURSES_CS }
